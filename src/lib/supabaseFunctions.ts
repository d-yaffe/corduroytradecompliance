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
      throw error;
    }

    return response;
  } catch (error: any) {
    console.error('Error calling python-proxy:', error);
    throw new Error(error.message || 'Failed to call Python backend');
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

