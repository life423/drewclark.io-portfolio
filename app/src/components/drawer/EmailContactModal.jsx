import React, { useEffect, useRef, useState } from 'react';
import { LuX } from 'react-icons/lu';
import clsx from 'clsx';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';

export default function EmailContactModal({ isOpen, onClose }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
    
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);
    const firstInputRef = useRef(null);

    // Lock body scroll when modal is open
    useLockBodyScroll(isOpen);

    // Handle escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Focus the close button or first input when modal opens
            setTimeout(() => {
                if (firstInputRef.current) {
                    firstInputRef.current.focus();
                } else if (closeButtonRef.current) {
                    closeButtonRef.current.focus();
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Reset form when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setEmail('');
            setMessage('');
            setSubmitStatus(null);
        }
    }, [isOpen]);

    // Validate email format
    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isEmailValid(email)) {
            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Submit to our API endpoint
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }
            
            // Success!
            setIsSubmitting(false);
            setSubmitStatus('success');
            
            // Close modal after success
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error sending message:', error);
            setIsSubmitting(false);
            setSubmitStatus('error');
            // Display a more detailed error if available
            alert(`Failed to send message: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Modal */}
            <div
                className="fixed inset-0 flex items-center justify-center p-4 z-[1000]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="contact-modal-title"
            >
                <div 
                    ref={modalRef}
                    className={clsx(
                        "bg-gradient-to-b from-brandGray-800 to-brandGray-900 rounded-lg shadow-xl",
                        "w-full max-w-md border border-brandGray-700",
                        "transform transition-all duration-300",
                        "flex flex-col max-h-[90vh]"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-brandGray-700/30">
                        <h2 id="contact-modal-title" className="text-lg font-medium text-brandGreen-300">
                            Get in Touch
                        </h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            aria-label="Close Modal"
                            className="p-2 text-brandGray-400 hover:text-brandGreen-300 transition-colors rounded-full
                                      focus:outline-none focus:ring-2 focus:ring-brandGreen-400"
                        >
                            <LuX className="h-5 w-5" />
                        </button>
                    </div>
                    
                    {/* Modal Body */}
                    <div className="p-4 flex-1 overflow-y-auto">
                        {submitStatus === 'success' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-brandGreen-800/30 flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brandGreen-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Message Sent!</h3>
                                <p className="text-brandGray-300">Thank you for your message! I'll get back to you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-brandGray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        ref={firstInputRef}
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-brandGray-700 border border-brandGray-600 rounded-md 
                                                text-white focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50 
                                                focus:border-brandGreen-500 transition-colors"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-brandGray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={clsx(
                                            "w-full px-3 py-2 bg-brandGray-700 border rounded-md",
                                            "text-white focus:outline-none focus:ring-2 transition-colors",
                                            submitStatus === 'error'
                                                ? "border-brandOrange-500 focus:ring-brandOrange-500/50 focus:border-brandOrange-500"
                                                : "border-brandGray-600 focus:ring-brandGreen-500/50 focus:border-brandGreen-500"
                                        )}
                                        placeholder="your.email@example.com"
                                    />
                                    {submitStatus === 'error' && (
                                        <p className="mt-1 text-xs text-brandOrange-400">
                                            Please enter a valid email address
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-brandGray-300 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-3 py-2 bg-brandGray-700 border border-brandGray-600 rounded-md 
                                                text-white focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50 
                                                focus:border-brandGreen-500 transition-colors resize-none"
                                        placeholder="How can I help you?"
                                    />
                                </div>
                            </form>
                        )}
                    </div>
                    
                    {/* Modal Footer */}
                    {submitStatus !== 'success' && (
                        <div className="p-4 border-t border-brandGray-700/30">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !name || !email || !message}
                                className={clsx(
                                    "w-full py-2 px-4 rounded-md font-medium text-sm transition-all duration-200",
                                    "focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50",
                                    isSubmitting || !name || !email || !message
                                        ? "bg-brandGray-700 text-brandGray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-brandGreen-600 to-brandGreen-500 text-white hover:shadow-lg hover:shadow-brandGreen-500/20"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </div>
                                ) : "Send Message"}
                            </button>
                            <p className="text-xs text-center text-brandGray-400 mt-2">
                                Your message will be saved securely
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
