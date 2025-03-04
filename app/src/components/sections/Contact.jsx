// FILE: app/src/components/sections/Contact.jsx
import React from 'react'

export default function Contact() {
  return (
    <section className="py-12" id="contact">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Contact Us
        </h2>
        <form className="space-y-4 bg-brandGray-800/30 p-8 rounded-lg">
          <div>
            <label 
              htmlFor="name"
              className="block text-sm font-medium text-white mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 rounded-md bg-brandGray-800 text-white border border-brandGray-700 focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
              required
            />
          </div>
          <div>
            <label 
              htmlFor="email"
              className="block text-sm font-medium text-white mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 rounded-md bg-brandGray-800 text-white border border-brandGray-700 focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
              required
            />
          </div>
          <div>
            <label 
              htmlFor="message"
              className="block text-sm font-medium text-white mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="w-full px-4 py-2 rounded-md bg-brandGray-800 text-white border border-brandGray-700 focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-brandGreen-600 text-white py-3 px-4 rounded-md hover:bg-brandGreen-700 transition-colors duration-300 font-medium"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  )
}
