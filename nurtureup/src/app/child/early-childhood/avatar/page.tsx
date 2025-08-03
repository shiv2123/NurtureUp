'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, RotateCcw, Save, ArrowLeft, ArrowRight } from 'lucide-react'

/**
 * Early Childhood Avatar Studio (Blueprint 5.4.4)
 * 
 * Per blueprint:
 * - Sections: Wardrobe, Accessories, Room Decor
 * - Swipe Carousel of items; locked items show star cost; tap to purchase
 * - Try-On Preview: drag garment onto avatar; pinch zoom rotates stage
 * - Save Outfit button bottom; audio "Looking good!"
 * - Room Decor: grid furniture items; long-press to place into draggable room scene
 */
export default function EarlyChildhoodAvatarPage() {
  const [activeSection, setActiveSection] = useState<'wardrobe' | 'accessories' | 'decor'>('wardrobe')
  const [stars, setStars] = useState(18)
  const [currentOutfit, setCurrentOutfit] = useState({
    hair: '👶',
    top: '👕',
    bottom: '👖',
    shoes: '👟',
    accessory: null as string | null
  })
  const [roomItems, setRoomItems] = useState<Array<{ id: string, item: string, x: number, y: number }>>([
    { id: '1', item: '🛏️', x: 20, y: 60 },
    { id: '2', item: '🪑', x: 70, y: 40 },
  ])
  const [ownedItems, setOwnedItems] = useState(new Set(['👶', '👕', '👖', '👟', '🛏️', '🪑']))
  const [avatarRotation, setAvatarRotation] = useState(0)
  const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(0)

  const sections = {
    wardrobe: {
      name: 'Wardrobe',
      icon: '👕',
      items: [
        { id: 'hair1', item: '👶', type: 'hair', cost: 0 },
        { id: 'hair2', item: '👧', type: 'hair', cost: 8 },
        { id: 'hair3', item: '🧒', type: 'hair', cost: 8 },
        { id: 'top1', item: '👕', type: 'top', cost: 0 },
        { id: 'top2', item: '👗', type: 'top', cost: 12 },
        { id: 'top3', item: '🎽', type: 'top', cost: 10 },
        { id: 'bottom1', item: '👖', type: 'bottom', cost: 0 },
        { id: 'bottom2', item: '🩳', type: 'bottom', cost: 8 },
        { id: 'bottom3', item: '👠', type: 'shoes', cost: 15 },
        { id: 'shoes1', item: '👟', type: 'shoes', cost: 0 },
        { id: 'shoes2', item: '🥿', type: 'shoes', cost: 10 },
      ]
    },
    accessories: {
      name: 'Accessories',
      icon: '🎀',
      items: [
        { id: 'acc1', item: '🎀', type: 'accessory', cost: 5 },
        { id: 'acc2', item: '👑', type: 'accessory', cost: 20 },
        { id: 'acc3', item: '🕶️', type: 'accessory', cost: 12 },
        { id: 'acc4', item: '🎩', type: 'accessory', cost: 15 },
        { id: 'acc5', item: '🧢', type: 'accessory', cost: 8 },
        { id: 'acc6', item: '💍', type: 'accessory', cost: 18 },
        { id: 'acc7', item: '📿', type: 'accessory', cost: 10 },
        { id: 'acc8', item: '🦋', type: 'accessory', cost: 25 },
      ]
    },
    decor: {
      name: 'Room Decor',
      icon: '🛏️',
      items: [
        { id: 'decor1', item: '🛏️', type: 'decor', cost: 0 },
        { id: 'decor2', item: '🪑', type: 'decor', cost: 0 },
        { id: 'decor3', item: '🎨', type: 'decor', cost: 15 },
        { id: 'decor4', item: '🌱', type: 'decor', cost: 8 },
        { id: 'decor5', item: '🧸', type: 'decor', cost: 12 },
        { id: 'decor6', item: '📚', type: 'decor', cost: 10 },
        { id: 'decor7', item: '🎵', type: 'decor', cost: 18 },
        { id: 'decor8', item: '🌟', type: 'decor', cost: 20 },
      ]
    }
  }

  const currentSection = sections[activeSection]
  const visibleItems = currentSection.items.slice(selectedCarouselIndex, selectedCarouselIndex + 4)

  const purchaseItem = (item: typeof currentSection.items[0]) => {
    if (ownedItems.has(item.item)) return
    
    if (stars >= item.cost) {
      setStars(prev => prev - item.cost)
      setOwnedItems(prev => new Set([...prev, item.item]))
      alert(`🎉 You got ${item.item}!`)
    } else {
      alert(`You need ${item.cost - stars} more stars! ⭐`)
    }
  }

  const equipItem = (item: typeof currentSection.items[0]) => {
    if (!ownedItems.has(item.item)) return

    if (item.type === 'accessory') {
      setCurrentOutfit(prev => ({ 
        ...prev, 
        accessory: prev.accessory === item.item ? null : item.item 
      }))
    } else {
      setCurrentOutfit(prev => ({ ...prev, [item.type]: item.item }))
    }
  }

  const rotateAvatar = () => {
    setAvatarRotation(prev => (prev + 90) % 360)
  }

  const saveOutfit = () => {
    // Play "Looking good!" audio
    console.log('Playing audio: Looking good!')
    alert('👗 Outfit saved! Looking good!')
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const addRoomItem = (item: string) => {
    if (!ownedItems.has(item)) return
    
    const newItem = {
      id: Date.now().toString(),
      item,
      x: Math.random() * 60 + 20, // Random position 20-80%
      y: Math.random() * 60 + 20
    }
    setRoomItems(prev => [...prev, newItem])
  }

  const moveRoomItem = (id: string, x: number, y: number) => {
    setRoomItems(prev => prev.map(item => 
      item.id === id ? { ...item, x, y } : item
    ))
  }

  const removeRoomItem = (id: string) => {
    setRoomItems(prev => prev.filter(item => item.id !== id))
  }

  const nextCarousel = () => {
    const maxIndex = Math.max(0, currentSection.items.length - 4)
    setSelectedCarouselIndex(prev => Math.min(prev + 1, maxIndex))
  }

  const prevCarousel = () => {
    setSelectedCarouselIndex(prev => Math.max(prev - 1, 0))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-pink-700">Avatar Studio 🎨</h1>
          <p className="text-pink-600">Create your perfect look!</p>
        </div>
        <div className="bg-yellow-200 px-4 py-2 rounded-full font-bold text-yellow-800 flex items-center gap-2">
          <Star className="w-4 h-4" />
          {stars} Stars
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex mb-6 bg-white/50 backdrop-blur-sm rounded-xl p-1">
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            onClick={() => {
              setActiveSection(key as keyof typeof sections)
              setSelectedCarouselIndex(0)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
              activeSection === key 
                ? 'bg-white shadow-md text-pink-700' 
                : 'text-pink-600 hover:bg-white/50'
            }`}
          >
            <span className="text-xl">{section.icon}</span>
            <span>{section.name}</span>
          </button>
        ))}
      </div>

      {activeSection === 'decor' ? (
        /* Room Decor Mode */
        <div className="space-y-6">
          {/* Room Preview */}
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100">
            <CardHeader>
              <CardTitle className="text-center text-orange-700">
                🏠 My Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-64 bg-gradient-to-b from-sky-100 to-green-100 rounded-lg border-2 border-brown-200 overflow-hidden">
                {/* Floor */}
                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-amber-200 to-amber-100" />
                
                {/* Room Items */}
                {roomItems.map((roomItem) => (
                  <div
                    key={roomItem.id}
                    className="absolute cursor-move text-4xl hover:scale-110 transition-transform"
                    style={{ left: `${roomItem.x}%`, top: `${roomItem.y}%` }}
                    draggable
                    onDragEnd={(e) => {
                      const rect = e.currentTarget.parentElement!.getBoundingClientRect()
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      moveRoomItem(roomItem.id, Math.max(0, Math.min(95, x)), Math.max(0, Math.min(90, y)))
                    }}
                    onDoubleClick={() => removeRoomItem(roomItem.id)}
                  >
                    {roomItem.item}
                  </div>
                ))}
                
                {/* Instructions */}
                {roomItems.length <= 2 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg text-center">
                      <p className="font-bold text-orange-700">Tap items below to add to your room!</p>
                      <p className="text-sm text-orange-600">Drag to move • Double-tap to remove</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Decor Items Grid */}
          <div className="grid grid-cols-4 gap-4">
            {currentSection.items.map((item) => {
              const isOwned = ownedItems.has(item.item)
              return (
                <button
                  key={item.id}
                  onClick={() => isOwned ? addRoomItem(item.item) : purchaseItem(item)}
                  onLongPress={() => isOwned && addRoomItem(item.item)}
                  disabled={!isOwned && stars < item.cost}
                  className={`aspect-square rounded-xl p-4 border-2 transition-all ${
                    isOwned 
                      ? 'bg-white border-pink-300 hover:border-pink-400 hover:scale-105' 
                      : stars >= item.cost
                        ? 'bg-gray-100 border-gray-300 hover:border-pink-300'
                        : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-3xl mb-2">{item.item}</div>
                  {!isOwned && (
                    <div className="text-xs font-bold text-pink-600 flex items-center justify-center gap-1">
                      {item.cost} <Star className="w-3 h-3" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Avatar Customization Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Preview */}
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100">
            <CardHeader>
              <CardTitle className="text-center text-purple-700 flex items-center justify-center gap-2">
                👤 Your Avatar
                <button
                  onClick={rotateAvatar}
                  className="ml-2 p-1 rounded-full bg-purple-200 hover:bg-purple-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8">
              <div 
                className="relative transition-transform duration-500"
                style={{ transform: `rotate(${avatarRotation}deg)` }}
              >
                <div className="text-8xl mb-4">{currentOutfit.hair}</div>
                <div className="text-6xl mb-2">{currentOutfit.top}</div>
                <div className="text-5xl mb-2">{currentOutfit.bottom}</div>
                <div className="text-4xl">{currentOutfit.shoes}</div>
                {currentOutfit.accessory && (
                  <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
                    {currentOutfit.accessory}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Item Carousel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-purple-700 flex items-center justify-between">
                <button 
                  onClick={prevCarousel}
                  disabled={selectedCarouselIndex === 0}
                  className="p-2 rounded-full bg-purple-200 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <span>{currentSection.name}</span>
                
                <button 
                  onClick={nextCarousel}
                  disabled={selectedCarouselIndex >= currentSection.items.length - 4}
                  className="p-2 rounded-full bg-purple-200 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {visibleItems.map((item) => {
                  const isOwned = ownedItems.has(item.item)
                  const isEquipped = currentOutfit[item.type as keyof typeof currentOutfit] === item.item
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => isOwned ? equipItem(item) : purchaseItem(item)}
                      disabled={!isOwned && stars < item.cost}
                      className={`aspect-square rounded-xl p-4 border-2 transition-all ${
                        isEquipped
                          ? 'bg-purple-200 border-purple-400 shadow-md'
                          : isOwned 
                            ? 'bg-white border-purple-300 hover:border-purple-400 hover:scale-105' 
                            : stars >= item.cost
                              ? 'bg-gray-100 border-gray-300 hover:border-purple-300'
                              : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-4xl mb-2">{item.item}</div>
                      {!isOwned ? (
                        <div className="text-xs font-bold text-purple-600 flex items-center justify-center gap-1">
                          {item.cost} <Star className="w-3 h-3" />
                        </div>
                      ) : isEquipped ? (
                        <div className="text-xs font-bold text-purple-700">Wearing</div>
                      ) : (
                        <div className="text-xs font-bold text-green-600">Owned</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Outfit Button */}
      {activeSection !== 'decor' && (
        <div className="fixed bottom-24 left-4 right-4 z-10">
          <Button 
            onClick={saveOutfit}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 text-lg shadow-xl"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Outfit - Looking Good! 🌟
          </Button>
        </div>
      )}
    </div>
  )
}