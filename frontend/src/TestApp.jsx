import React from 'react'

function TestApp() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Project Management Tool
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Frontend is working! 🎉
        </p>
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-blue-800">✅ React is loaded</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-green-800">✅ Tailwind CSS is working</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <p className="text-purple-800">✅ Vite dev server is running</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestApp
