import { supabase } from './supabase';
import { getUserMetadata } from './userService';

export interface ExceptionItem {
  id: number;
  product: string;
  sku: string;
  reason: string;
  hts: string;
  status: string;
  origin: string;
  value: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'lowConfidence' | 'missingDoc' | 'multipleHTS' | 'materialIssues';
  product_id: number;
  classification_result_id: number;
  confidence: number;
  tariff_rate?: number;
}

export interface RecentActivity {
  product: string;
  hts: string;
  confidence: string;
  time: string;
  status: string;
}

/**
 * Fetch exceptions (products with confidence < threshold and not approved)
 */
export async function getExceptions(userId: string): Promise<ExceptionItem[]> {
  try {
    // First get user's confidence threshold
    const userMetadata = await getUserMetadata(userId);
    if (!userMetadata) {
      console.log('No user metadata found');
      return [];
    }

    const threshold = userMetadata.confidence_threshold || 0.8;

    // Query classification results with product details
    // First get all products for this user
    const { data: userProducts, error: productsError } = await supabase
      .from('user_products')
      .select('id, product_name, product_description, country_of_origin, unit_cost')
      .eq('user_id', userId);

    if (productsError) {
      console.error('Error fetching user products:', productsError);
      return [];
    }

    if (!userProducts || userProducts.length === 0) {
      return [];
    }

    const productIds = userProducts.map(p => p.id);

    // Then get classification results for these products
    const { data: results, error } = await supabase
      .from('user_product_classification_results')
      .select('id, confidence, hts_classification, product_id, classification_run_id, classified_at, tariff_rate')
      .in('product_id', productIds)
      .lt('confidence', threshold)
      .order('classified_at', { ascending: false });

    if (error) {
      console.error('Error fetching exceptions:', error);
      return [];
    }

    if (!results || results.length === 0) {
      return [];
    }

    // Check which results are not approved
    const resultIds = results.map(r => r.id);
    const { data: history, error: historyError } = await supabase
      .from('user_product_classification_history')
      .select('classification_result_id, approved')
      .in('classification_result_id', resultIds);

    if (historyError) {
      console.error('Error fetching approval history:', historyError);
    }

    // Create a set of approved result IDs
    const approvedIds = new Set(
      (history || [])
        .filter(h => h.approved === true)
        .map(h => h.classification_result_id)
    );

    // Create a map of product_id to product for quick lookup
    const productMap = new Map(userProducts.map(p => [p.id, p]));

    // Filter out approved results and map to ExceptionItem format
    const exceptions: ExceptionItem[] = results
      .filter(r => !approvedIds.has(r.id))
      .map((result: any) => {
        const product = productMap.get(result.product_id);
        if (!product) return null; // Skip if product not found
        
        const confidencePercent = Math.round((result.confidence || 0) * 100);
        
        // Determine priority based on confidence
        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (result.confidence < threshold * 0.7) {
          priority = 'high';
        } else if (result.confidence < threshold * 0.85) {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        // Format value
        const value = product.unit_cost 
          ? `$${Number(product.unit_cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'N/A';

        return {
          id: result.id,
          product: product.product_name || 'Unnamed Product',
          sku: `PROD-${product.id}`,
          reason: `Low confidence (${confidencePercent}%)`,
          hts: result.hts_classification || 'N/A',
          status: priority === 'high' ? 'urgent' : 'review',
          origin: product.country_of_origin || 'Unknown',
          value: value,
          description: product.product_description || '',
          priority: priority,
          category: 'lowConfidence',
          product_id: product.id,
          classification_result_id: result.id,
          confidence: result.confidence,
          tariff_rate: result.tariff_rate,
        };
      })
      .filter((e): e is ExceptionItem => e !== null);

    return exceptions;
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return [];
  }
}

/**
 * Fetch recent classification runs (latest 3)
 */
export async function getRecentActivity(userId: string): Promise<RecentActivity[]> {
  try {
    // Get latest 3 classification runs
    const { data: runs, error } = await supabase
      .from('classification_runs')
      .select('id, created_at, status, run_type')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }

    if (!runs || runs.length === 0) {
      return [];
    }

    // Map to RecentActivity format
    const activities: RecentActivity[] = [];

    for (const run of runs) {
      // Get classification results for this run
      const { data: results, error: resultsError } = await supabase
        .from('user_product_classification_results')
        .select('id, hts_classification, confidence, product_id')
        .eq('classification_run_id', run.id)
        .limit(1);

      if (resultsError || !results || results.length === 0) {
        continue;
      }

      const firstResult = results[0] as { id: number; hts_classification: string | null; confidence: number | null; product_id: number };
      
      if (!firstResult || !firstResult.product_id) {
        continue;
      }
      
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('user_products')
        .select('id, product_name, user_id')
        .eq('id', firstResult.product_id)
        .eq('user_id', userId)
        .single();

      if (productError || !product) {
        continue;
      }

      const confidencePercent = Math.round(((firstResult.confidence as number) || 0) * 100);
      const runDate = new Date(run.created_at);
      const now = new Date();
      const hoursAgo = Math.floor((now.getTime() - runDate.getTime()) / (1000 * 60 * 60));
      
      let timeStr = '';
      if (hoursAgo < 1) {
        timeStr = 'Just now';
      } else if (hoursAgo < 24) {
        timeStr = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
      } else {
        const daysAgo = Math.floor(hoursAgo / 24);
        timeStr = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
      }

      activities.push({
        product: product.product_name || 'Unnamed Product',
        hts: (firstResult.hts_classification as string) || 'N/A',
        confidence: `${confidencePercent}%`,
        time: timeStr,
        status: 'auto-approved',
      });
    }

    return activities;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export interface DashboardStats {
  exceptions: number;
  classified: number;
  productProfiles: number;
  avgConfidence: string;
}

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // 1. Exceptions: All products that have not been approved by user
    const exceptions = await getExceptions(userId);
    const exceptionsCount = exceptions.length;

    // 2. Classified: All classification runs by user in the last 1 month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const { data: runs, error: runsError } = await supabase
      .from('classification_runs')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', oneMonthAgo.toISOString());

    const classifiedCount = runsError ? 0 : (runs?.length || 0);

    // 3. Product Profiles: All products approved by user in total history
    // Get all approved classification result IDs
    const { data: approvedHistory, error: approvedError } = await supabase
      .from('user_product_classification_history')
      .select('classification_result_id')
      .eq('approved', true);

    if (approvedError || !approvedHistory || approvedHistory.length === 0) {
      return {
        exceptions: exceptionsCount,
        classified: classifiedCount,
        productProfiles: 0,
        avgConfidence: '0%',
      };
    }

    const approvedResultIds = approvedHistory.map(h => h.classification_result_id);

    // Get classification results for these approved IDs
    const { data: approvedResults, error: resultsError } = await supabase
      .from('user_product_classification_results')
      .select('id, confidence, product_id')
      .in('id', approvedResultIds);

    if (resultsError || !approvedResults || approvedResults.length === 0) {
      return {
        exceptions: exceptionsCount,
        classified: classifiedCount,
        productProfiles: 0,
        avgConfidence: '0%',
      };
    }

    // Get product IDs and filter by user
    const approvedProductIds = approvedResults.map(r => r.product_id);
    const { data: userProducts, error: productsError } = await supabase
      .from('user_products')
      .select('id')
      .eq('user_id', userId)
      .in('id', approvedProductIds);

    const productProfilesCount = productsError ? 0 : (userProducts?.length || 0);

    // 4. Average Confidence: Average confidence level for all approved products in history
    // Filter approved results by user's products
    const userProductIds = new Set(userProducts?.map(p => p.id) || []);
    const userApprovedResults = approvedResults.filter(r => userProductIds.has(r.product_id));

    let avgConfidence = '0%';
    if (userApprovedResults.length > 0) {
      const confidences = userApprovedResults
        .map(r => r.confidence)
        .filter((c): c is number => c !== null && c !== undefined);
      
      if (confidences.length > 0) {
        const sum = confidences.reduce((acc, val) => acc + val, 0);
        const avg = (sum / confidences.length) * 100;
        avgConfidence = `${avg.toFixed(1)}%`;
      }
    }

    return {
      exceptions: exceptionsCount,
      classified: classifiedCount,
      productProfiles: productProfilesCount,
      avgConfidence: avgConfidence,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      exceptions: 0,
      classified: 0,
      productProfiles: 0,
      avgConfidence: '0%',
    };
  }
}

