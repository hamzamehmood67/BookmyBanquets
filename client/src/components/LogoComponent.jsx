import { Heart } from "lucide-react"

const LogoComponent = () => {
  return (
    <div className="absolute right-20 top-10 flex items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500">
          <Heart className="h-6 w-6 text-white" fill="white" />
        </div>
        <span className="text-xl font-semibold text-gray-800">BmB</span>
      </div>
    </div>
  )
}

export default LogoComponent;