import React from 'react'

export default function Contact() {
    return (
        <section className='p-8 bg-brandGray-900/80 rounded-lg shadow-lg mx-4 mb-8'>
            <h2 className='text-3xl font-bold mb-6 text-white'>
                Contact Us
            </h2>
            <form className='space-y-4'>
                <div>
                    <label 
                        htmlFor='name'
                        className='block text-sm font-medium text-white mb-1'
                    >
                        Name
                    </label>
                    <input
                        type='text'
                        id='name'
                        name='name'
                        className='w-full px-4 py-2 rounded-md bg-brandGray-800 text-white border border-brandGray-700 focus:outline-none focus:ring-2 focus:ring-brandBlue-500'
                        required
                    />
                </div>
                <div>
                    <label 
                        htmlFor='email'
                        className='block text-sm font-medium text-white mb-1'
                    >
                        Email
                    </label>
                    <input
                        type='email'
                        id='email'
                        name='email'
                        className='w-full px-4 py-2 rounded-md bg-brandGray-800 text-white border border-brandGray-700 focus:outline-none focus:ring-2 focus:ring-brandBlue-500'
                        required
                    />
                </div>
                <div>
                    <label 
                        htmlFor='message'
                        className='block text-sm font-medium text-white mb-1'
                    >
                        Message
                    </label>
                    <textarea
                        id='message'
                        name='message'
                        rows='4'
                        className='w-full px-4 py-2 rounded-md bg-brandGray-800 text-white border border-brandGray-700 focus:outline-none focus:ring-2 focus:ring-brandBlue-500'
                        required
                    ></textarea>
                </div>
                <button
                    type='submit'
                    className='w-full bg-brandBlue-600 text-white py-2 px-4 rounded-md hover:bg-brandBlue-700 transition duration-300'
                >
                    Send Message
                </button>
            </form>
        </section>
    )
}
