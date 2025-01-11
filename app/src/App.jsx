import React, { Component } from 'react'



class App extends Component {
    render() {
        return (
            <div>
                <h1 className='text-4xl font-bold text-blue-500'>
                    Hello from React + Tailwind!
                </h1>
                <p className='mt-4 text-gray-600'>
                    This is a simple example of a React component with Tailwind
                    CSS.
                </p>
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'>
                    Click me!
                </button>
            </div>
        )
    }
}

export default App
