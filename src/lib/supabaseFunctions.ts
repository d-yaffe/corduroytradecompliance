import { supabase } from './supabase';

type Action = "preprocess" | "parse" | "rules" | "rulings";

/**
 * Call the python-proxy Supabase Edge Function
 */
export async function callPythonProxy(
  action: Action,
  data: Record<string, any>
): Promise<any> {
  try {
    const { data: response, error } = await supabase.functions.invoke('python-proxy', {
      body: {
        action,
        ...data,
      },
    });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        context: error.context,
        status: error.status,
      });
      
      // Only show "not deployed" message for actual function not found errors
      // Check for specific error codes/messages that indicate function doesn't exist
      const isFunctionNotFound = 
        error.message?.includes('Function not found') ||
        error.message?.includes('404') ||
        (error.status === 404) ||
        (error.name === 'FunctionsHttpError' && error.status === 404);
      
      if (isFunctionNotFound) {
        throw new Error(
          'Edge Function not found or not deployed. Please ensure the "python-proxy" edge function is deployed to your Supabase project. ' +
          'See: https://supabase.com/docs/guides/functions'
        );
      }
      
      // For other errors, pass through the original error message
      throw error;
    }

    // Handle case where response might be a string that needs parsing
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch {
        return response;
      }
    }

    return response;
  } catch (error: any) {
    console.error('Error calling python-proxy:', error);
    
    // Re-throw if it's already a helpful error message
    if (error.message && error.message.includes('Edge Function not found')) {
      throw error;
    }
    
    // If the error has a message, use it; otherwise provide a generic one
    const errorMessage = error.message || error.toString() || 'Failed to call Python backend';
    throw new Error(errorMessage);
  }
}

/**
 * Generate a ruling/response for chat
 */
export async function generateRuling(
  message: string,
  conversationHistory?: Array<{ role: string; content: string }>,
  productContext?: {
    name?: string;
    description?: string;
    hts?: string;
    origin?: string;
  }
): Promise<string> {
  try {
    const response = await callPythonProxy('rulings', {
      message,
      conversation_history: conversationHistory || [],
      product_context: productContext || {},
    });

    // Handle different response formats
    if (typeof response === 'string') {
      return response;
    } else if (response?.response || response?.text || response?.content) {
      return response.response || response.text || response.content;
    } else if (response?.data) {
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    }

    return JSON.stringify(response);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to generate ruling');
  }
}

/**
 * Preprocess product data
 */
export async function preprocessProduct(data: any): Promise<any> {
  return callPythonProxy('preprocess', data);
}

/**
 * Parse product information
 */
export async function parseProduct(data: any): Promise<any> {
  return callPythonProxy('parse', data);
}

/**
 * Apply rules to product
 */
export async function applyRules(data: any): Promise<any> {
  return callPythonProxy('rules', data);
}


