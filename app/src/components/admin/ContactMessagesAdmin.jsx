import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';

/**
 * Admin inbox for contact form submissions.
 *
 * Sign in with ADMIN_PASSWORD. The server sets an HttpOnly session cookie,
 * so nothing secret lives in the URL, in storage, or in this component.
 */
export default function ContactMessagesAdmin() {
    // 'checking' until we know whether a session exists, then 'signedOut' or 'signedIn'
    const [authState, setAuthState] = useState('checking');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Any 401 means the session is gone (expired, or signed out elsewhere)
    const handleUnauthorized = useCallback(() => {
        setAuthState('signedOut');
        setMessages([]);
        setSelectedMessage(null);
    }, []);

    const loadMessages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/messages');
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load messages');
            }
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [handleUnauthorized]);

    // On first load, reuse an existing session if there is one
    useEffect(() => {
        fetch('/api/admin/session')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setAuthState('signedIn');
                    loadMessages();
                } else {
                    setAuthState('signedOut');
                }
            })
            .catch(() => setAuthState('signedOut'));
    }, [loadMessages]);

    const signIn = async (event) => {
        event.preventDefault();
        setIsSigningIn(true);
        setLoginError(null);
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Sign-in failed');
            }
            setPassword('');
            setAuthState('signedIn');
            loadMessages();
        } catch (err) {
            setLoginError(err.message);
        } finally {
            setIsSigningIn(false);
        }
    };

    const signOut = async () => {
        await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
        handleUnauthorized();
    };

    // Mark a message as read/unread
    const toggleMessageRead = async (id, read) => {
        try {
            const response = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read }),
            });
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to update message');
            }
            setMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, read } : msg)));
            setSelectedMessage(prev => (prev?.id === id ? { ...prev, read } : prev));
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete a message
    const deleteMessage = async (id) => {
        if (!window.confirm('Delete this message? This cannot be undone.')) {
            return;
        }
        try {
            const response = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (response.status === 401) {
                handleUnauthorized();
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
            setMessages(prev => prev.filter(msg => msg.id !== id));
            setSelectedMessage(prev => (prev?.id === id ? null : prev));
        } catch (err) {
            setError(err.message);
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
    
    if (authState === 'checking') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen-500"></div>
                </div>
            </div>
        );
    }

    if (authState === 'signedOut') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto bg-brandGray-800 p-6 rounded-lg shadow-lg border border-brandGray-700">
                    <h1 className="text-2xl font-bold text-brandGreen-400 mb-6">Admin sign in</h1>
                    <form onSubmit={signIn} className="space-y-4">
                        <div>
                            <label htmlFor="admin-password" className="block text-sm text-brandGray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                autoComplete="current-password"
                                autoFocus
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded bg-brandGray-900 border border-brandGray-600 text-white focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50 focus:border-brandGreen-500"
                            />
                        </div>
                        {loginError && (
                            <p role="alert" className="text-sm text-brandOrange-400">{loginError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={isSigningIn || password.length === 0}
                            className="w-full py-2 px-4 rounded bg-brandGreen-500 hover:bg-brandGreen-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSigningIn ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-brandGray-800 p-6 rounded-lg shadow-lg border border-brandGray-700">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-brandGreen-400">Contact Messages</h1>
                    <button onClick={signOut} className="text-sm text-brandGray-400 hover:text-white transition-colors">
                        Sign out
                    </button>
                </div>
                {error && <p role="alert" className="mb-4 text-sm text-brandOrange-400">{error}</p>}
                
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
                                        onClick={loadMessages}
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
