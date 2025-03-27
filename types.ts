interface DocMetadata {
  createdAt: string,
  modifiedAt: string
}

export interface Doc {
  id: string,
  name: string,
  tiptapJson: string,
  modelId?: string,
  createdAt?: string,
  metadata?: DocMetadata
}

export interface Model {
  id: string,
  name: string,
  size: number,
  parameters?: number,
  quantMethod?: string,
  languages?: string,
  type?: string,
  downloadUrl: string,
  licenseType?: string,
  licenseUrl?: string,
  modelPath?: string,
  moreInfoUrl?: string,
  isDownloaded: number
}

export interface Template {
  id: string,
  name: string,
  description: string,
  category: string,
  prompt: string
}
