import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

/**
 * Admin interface for viewing contact form submissions
 * 
 * Accessible only with a valid admin token
 * URL format: /admin-messages?token=YOUR_SECRET_TOKEN
 */
export default function ContactMessagesAdmin() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const [tokenValid, setTokenValid] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    
    // Get token from URL query parameters
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get('token');
        
        if (urlToken) {
            setToken(urlToken);
            loadMessages(urlToken);
        }
    }, []);
    
    // Load messages using token
    const loadMessages = async (accessToken) => {
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('Fetching messages with token:', accessToken);
            
            // First try direct API call to check token validity
            const testResponse = await fetch(`/api/admin/generate-token`);
            console.log('Token generation response:', await testResponse.json());
            
            const apiUrl = `/api/admin/messages?token=${accessToken}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load messages');
            }
            
            setMessages(data.messages || []);
            setTokenValid(true);
        } catch (error) {
            console.error('Error loading messages:', error);
            setError(error.message);
            setTokenValid(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Mark a message as read/unread
    const toggleMessageRead = async (id, read) => {
        try {
            const response = await fetch(`/api/admin/messages/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    read
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update message');
            }
            
            // Update local state
            setMessages(messages.map(msg => 
                msg.id === id ? { ...msg, read } : msg
            ));
        } catch (error) {
            console.error('Error updating message:', error);
            alert(`Error: ${error.message}`);
        }
    };
    
    // Delete a message
    const deleteMessage = async (id) => {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/messages/${id}?token=${token}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
            
            // Update local state
            setMessages(messages.filter(msg => msg.id !== id));
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            alert(`Error: ${error.message}`);
        }
    };
    
    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(date);
    };
    
    // If no token provided
    if (!token) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-brandGray-800 p-6 rounded-lg shadow-lg border border-brandGray-700">
                    <h1 className="text-2xl font-bold text-brandGreen-400 mb-6">Admin Access Required</h1>
                    <p className="text-white mb-4">You need an admin token to access this page.</p>
                    <p className="text-brandGray-400 text-sm">
                        Add <code className="bg-brandGray-700 px-1 py-0.5 rounded">?token=YOUR_TOKEN</code> to the URL.
                    </p>
                </div>
            </div>
        );
    }
    
    // If token is invalid
    if (!isLoading && !tokenValid) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-brandGray-800 p-6 rounded-lg shadow-lg border border-brandGray-700">
                    <h1 className="text-2xl font-bold text-brandOrange-400 mb-6">Access Denied</h1>
                    <p className="text-white mb-4">The provided admin token is invalid.</p>
                    <p className="text-brandGray-400 text-sm">{error}</p>
                    <div className="mt-4 p-4 bg-brandGray-900 rounded text-xs text-brandGray-400 font-mono whitespace-pre-wrap overflow-auto">
                        <p>Debug Information:</p>
                        <p>Token length: {token?.length || 0}</p>
                        <p>Token: {token}</p>
                        <button 
                            className="mt-4 px-3 py-1 bg-brandGray-700 text-brandGreen-400 rounded"
                            onClick={() => loadMessages(token)}
                        >
                            Retry Token Validation
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-brandGray-800 p-6 rounded-lg shadow-lg border border-brandGray-700">
                <h1 className="text-2xl font-bold text-brandGreen-400 mb-6">Contact Messages</h1>
                
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-brandGray-400">
                        <p className="text-lg">No messages yet</p>
                        <p className="text-sm mt-2">When users submit contact forms, they'll appear here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Message List */}
                        <div className="w-full md:w-1/3">
                            <div className="bg-brandGray-900 rounded-lg border border-brandGray-700 overflow-hidden">
                                <div className="p-3 border-b border-brandGray-700 bg-brandGray-800 flex justify-between items-center">
                                    <h2 className="font-medium text-white">Messages ({messages.length})</h2>
                                    <button 
                                        className="text-xs text-brandGreen-400 hover:text-brandGreen-300"
                                        onClick={() => loadMessages(token)}
                                    >
                                        Refresh
                                    </button>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto">
                                    {messages.map(message => (
                                        <div 
                                            key={message.id}
                                            className={clsx(
                                                "p-3 border-b border-brandGray-700/50 cursor-pointer transition-colors",
                                                selectedMessage?.id === message.id ? "bg-brandGray-700" : "hover:bg-brandGray-800",
                                                !message.read && "border-l-2 border-l-brandGreen-500"
                                            )}
                                            onClick={() => setSelectedMessage(message)}
                                        >
                                            <div className="flex justify-between">
                                                <h3 className={clsx(
                                                    "font-medium",
                                                    message.read ? "text-brandGray-300" : "text-white"
                                                )}>
                                                    {message.name}
                                                </h3>
                                                <span className="text-xs text-brandGray-500">
                                                    {new Date(message.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-brandGray-400 truncate">{message.email}</p>
                                            <p className="text-xs text-brandGray-500 mt-1 truncate">{message.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Message Detail */}
                        <div className="w-full md:w-2/3">
                            {selectedMessage ? (
                                <div className="bg-brandGray-900 rounded-lg border border-brandGray-700 h-full">
                                    <div className="p-3 border-b border-brandGray-700 bg-brandGray-800 flex justify-between items-center">
                                        <h2 className="font-medium text-white">Message Details</h2>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                className={clsx(
                                                    "text-xs p-1 rounded",
                                                    selectedMessage.read 
                                                        ? "text-brandGray-400 hover:text-brandGreen-400" 
                                                        : "text-brandGreen-400 hover:text-brandGreen-300"
                                                )}
                                                onClick={() => toggleMessageRead(selectedMessage.id, !selectedMessage.read)}
                                                title={selectedMessage.read ? "Mark as unread" : "Mark as read"}
                                            >
                                                {selectedMessage.read ? "Mark Unread" : "Mark Read"}
                                            </button>
                                            <button 
                                                className="text-xs text-brandOrange-400 hover:text-brandOrange-300 p-1 rounded"
                                                onClick={() => deleteMessage(selectedMessage.id)}
                                                title="Delete message"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-4 pb-4 border-b border-brandGray-700/30">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-medium text-white">{selectedMessage.name}</h3>
                                                <span className="text-xs text-brandGray-500">
                                                    {formatDate(selectedMessage.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-brandGreen-400 text-sm">
                                                <a 
                                                    href={`mailto:${selectedMessage.email}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {selectedMessage.email}
                                                </a>
                                            </p>
                                        </div>
                                        <div className="text-white whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </div>
                                        
                                        <div className="mt-6">
                                            <button 
                                                className="flex items-center space-x-1 text-brandGreen-400 hover:text-brandGreen-300 text-sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedMessage.email);
                                                    alert('Email copied to clipboard!');
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                <span>Copy Email</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-brandGray-900 rounded-lg border border-brandGray-700 h-full flex items-center justify-center p-6">
                                    <div className="text-center">
                                        <p className="text-brandGray-400">Select a message to view details</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
