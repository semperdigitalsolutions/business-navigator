import { useState } from 'react'
import { APP_NAME, APP_VERSION } from '@shared/constants'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            {APP_NAME}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your AI-powered business formation platform
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
            >
              Count: {count}
            </button>
          </div>

          <p className="text-lg text-green-600 dark:text-green-400 font-medium">
            Frontend is ready! 🚀 (Powered by Bun)
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
