import { Client, Databases, Account } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'whatsorder-demo'; // Placeholder

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

// Constants for Database IDs (replace with actual IDs or env vars)
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main'; // Placeholder
export const RESTAURANTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_RESTAURANTS_ID || 'restaurants'; // Placeholder
export const MENU_ITEMS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MENU_ITEMS_ID || 'menu_items'; // Placeholder


