export type Product = {
  id: string
  name: string
  price: number
  image_url?: string
  url: string
}

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
  products?: Product[]
}
