import { Product } from "@/app/types/chat"

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded-lg p-3 mt-3 bg-gray-50">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-32 object-cover rounded"
        />
      )}

      <h4 className="font-semibold mt-2">{product.name}</h4>
      <p className="text-sm text-gray-600">${product.price}</p>
      <p>fdshjkfhladjfhsdhfldsk</p>

      <a
        href={product.url}
        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
      >
        View product
      </a>
    </div>
  )
}
