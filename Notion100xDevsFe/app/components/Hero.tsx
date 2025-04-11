import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import React from 'react'

const Hero = () => {
  return (
    <div className="max-w-7xl flex items-center mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-[40rem]">
          <h1 className="text-6xl font-bold mb-6">
            100xNotion
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Google Docs Won&apos;t burn your eyes anymore.

            Interact with others real time with this 100xNotion Editor
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-white text-black cursor-pointer hover:bg-gray-200">
              Sign in
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 cursor-pointer flex items-center hover:bg-white/10">
              Create Room <ArrowRight className="" />
            </Button>
          </div>
        </div>

        {/* Notion image */}
        <h1>Notion Doc Example</h1>
      </div>
  )
}

export default Hero