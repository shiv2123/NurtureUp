import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Camera, 
  Image, 
  Sparkles,
  Upload,
  Zap
} from 'lucide-react'

export default async function CameraPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="py-6 space-y-8">
      {/* Camera Header */}
      <div className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-bounce-subtle">📸</div>
          <h1 className="text-4xl font-bold text-white mb-3 font-child">
            Magic Camera
          </h1>
          <p className="text-xl text-white/90 font-child">
            Capture your awesome moments and quest completions! ✨
          </p>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 animate-pulse"></div>
      </div>

      {/* Camera Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quest Photo */}
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group">
          <CardHeader className="text-center border-b border-blue-100">
            <CardTitle className="flex flex-col items-center gap-3 text-blue-800 font-child">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              Quest Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-gray-800 font-child mb-3">
              Complete a Quest
            </h3>
            <p className="text-gray-600 font-child mb-6">
              Take a photo to prove you finished your quest and earn stars!
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-child text-lg py-3">
              <Camera className="w-5 h-5 mr-2" />
              Take Quest Photo
            </Button>
          </CardContent>
        </Card>

        {/* Milestone Memory */}
        <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer group">
          <CardHeader className="text-center border-b border-purple-100">
            <CardTitle className="flex flex-col items-center gap-3 text-purple-800 font-child">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              Memory Moment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-800 font-child mb-3">
              Capture a Memory
            </h3>
            <p className="text-gray-600 font-child mb-6">
              Save special moments for your family timeline and memory book!
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-child text-lg py-3">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Memory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-center text-yellow-800 font-child">
            📱 Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100 font-child">
              <Upload className="w-5 h-5" />
              <span className="text-sm">Upload Photo</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100 font-child">
              <Image className="w-5 h-5" />
              <span className="text-sm">Photo Gallery</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100 font-child">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Quick Capture</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-center text-green-800 font-child flex items-center justify-center gap-2">
            <span className="text-2xl">💡</span>
            Photo Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-green-700 font-child">For Quest Photos:</h3>
              <ul className="space-y-2 text-sm text-gray-700 font-child">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Show your completed task clearly
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Make sure there's good lighting
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Include yourself in the photo
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Smile and show you're proud!
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-blue-700 font-child">For Memory Photos:</h3>
              <ul className="space-y-2 text-sm text-gray-700 font-child">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Capture special moments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Include family members
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Add a fun description
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  Share with your family
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}