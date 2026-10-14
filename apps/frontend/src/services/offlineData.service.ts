import { axiosClient } from '../api/axiosClient';
import type { Client } from '../types/client';
import type { Product } from '../types/product';
import type { ProductOption } from '../types/order';
import { fetchWithLocalCache, readLocalCache, writeLocalCache } from '../utils/localCache';

export const CLIENTS_CACHE_KEY = 'tiamaria:clients';
export const PRODUCTS_CACHE_KEY = 'tiamaria:products';
const ORDER_PRODUCTS_CACHE_KEY = 'tiamaria:order-products';
const ORDER_PRODUCTS_WITH_STOCK_CACHE_KEY = 'tiamaria:order-products-with-stock';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isClientList(value: unknown): value is Client[] {
  return Array.isArray(value) && value.every((client: unknown) =>
    isRecord(client)
    && typeof client.id === 'string'
    && typeof client.contact_name === 'string'
    && typeof client.phone === 'string'
    && typeof client.address === 'string',
  );
}

function isProductList(value: unknown): value is Product[] {
  return Array.isArray(value) && value.every((product: unknown) =>
    isRecord(product)
    && typeof product.id === 'string'
    && typeof product.name === 'string'
    && (typeof product.price === 'number' || typeof product.price === 'string')
    && typeof product.is_available === 'boolean'
    && typeof product.is_active === 'boolean'
    && typeof product.stock_quantity === 'number'
    && typeof product.min_stock_alert === 'number',
  );
}

function isProductOptionList(value: unknown): value is ProductOption[] {
  return Array.isArray(value) && value.every((product: unknown) =>
    isRecord(product)
    && typeof product.id === 'string'
    && typeof product.name === 'string'
    && (typeof product.price === 'number' || typeof product.price === 'string')
    && typeof product.stock_quantity === 'number'
    && typeof product.is_active === 'boolean'
    && typeof product.is_available === 'boolean',
  );
}

function getData<T>(key: string, isOffline: boolean, request: () => Promise<T>, isValid: (value: unknown) => value is T): Promise<T> {
  if (isOffline) {
    const cachedValue = readLocalCache(key, isValid);
    return cachedValue === null
      ? Promise.reject(new Error(`No locally cached data is available for "${key}" while offline.`))
      : Promise.resolve(cachedValue);
  }

  return fetchWithLocalCache(key, request, isValid);
}

export function getCachedClients(isOffline = false): Promise<Client[]> {
  return getData(
    CLIENTS_CACHE_KEY,
    isOffline,
    async () => (await axiosClient.get<Client[]>('/clients')).data,
    isClientList,
  );
}

export function cacheClients(clients: Client[]): void {
  writeLocalCache(CLIENTS_CACHE_KEY, clients);
}

export function getCachedProducts(isOffline = false): Promise<Product[]> {
  return getData(
    PRODUCTS_CACHE_KEY,
    isOffline,
    async () => (await axiosClient.get<Product[]>('/products')).data,
    isProductList,
  );
}

export function cacheProducts(products: Product[]): void {
  writeLocalCache(PRODUCTS_CACHE_KEY, products);
}

export function getCachedOrderProducts(includeOutOfStock = false, isOffline = false): Promise<ProductOption[]> {
  const key = includeOutOfStock ? ORDER_PRODUCTS_WITH_STOCK_CACHE_KEY : ORDER_PRODUCTS_CACHE_KEY;

  return getData(
    key,
    isOffline,
    async () => (
      await axiosClient.get<ProductOption[]>('/products', {
        ...(includeOutOfStock ? { params: { includeOutOfStock: true } } : {}),
      })
    ).data,
    isProductOptionList,
  );
}
