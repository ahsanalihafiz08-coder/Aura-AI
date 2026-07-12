export interface Lead {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  value: number;
  status: "Hot" | "Warm" | "Cold";
  source: string;
  lastContact: string;
  notes: string;
  automatedAction: string;
}

export type SimulatedScreen = 
  | "login" 
  | "dashboard" 
  | "leadDetails" 
  | "voiceAgent" 
  | "chatAssistant" 
  | "settings"
  | "addLead"
  | "crm";

export interface CodeFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export interface FolderNode {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FolderNode[];
  fileKey?: string; // key to match in data.ts
}

export interface Persona {
  name: string;
  role: string;
  businessSize: string;
  painPoints: string[];
  goals: string[];
  quote: string;
  avatarSeed: string; // seed for visual avatar styling
}

export interface RiskItem {
  risk: string;
  category: "Technical" | "Market" | "Financial" | "Operational";
  probability: "High" | "Medium" | "Low";
  impact: "Critical" | "Major" | "Minor";
  mitigation: string;
}

export interface RoadmapMilestone {
  phase: string;
  title: string;
  duration: string;
  items: string[];
  color: string;
}

export interface DbField {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface DbCollection {
  name: string;
  description: string;
  fields: DbField[];
  rules: string;
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  headers: Record<string, string>;
  requestBody?: string;
  responseBody: string;
}
