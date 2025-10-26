import React, { useState, useEffect, useRef } from 'react';
import { Card, Title, Text, Select, TextInput, Button, ScrollArea, Loader, Badge, NavLink, ActionIcon, Modal, Group } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { getToken } from '../lib/api';

type Project = { id: string; name: string; slug: string };

type Chat = {
    id: string;
    user_id: string;
    project_id: string;
    title: string;
    created_at: number;
    updated_at: number;
};

type Message = {
    id: string;
    chat_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: number;
};

export function DokAgent() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const API = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000/v1';

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            fetchChats();
        }
    }, [selectedProjectId]);

    useEffect(() => {
        if (selectedChatId) {
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [selectedChatId]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function fetchProjects() {
        try {
            const token = getToken();
            const res = await fetch(`${API}/projects`, {
                headers: token ? { authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed to fetch projects');
            const json = await res.json() as { projects: Project[] };
            setProjects(json.projects || []);
            if (json.projects?.length > 0 && !selectedProjectId) {
                setSelectedProjectId(json.projects[0].id);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    }

    async function fetchChats() {
        if (!selectedProjectId) return;
        try {
            const token = getToken();
            const res = await fetch(`${API}/chats?projectId=${selectedProjectId}`, {
                headers: token ? { authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed to fetch chats');
            const json = await res.json() as { chats: Chat[] };
            setChats(json.chats || []);
        } catch (err) {
            console.error('Error fetching chats:', err);
        }
    }

    async function fetchMessages() {
        if (!selectedChatId) return;
        try {
            const token = getToken();
            const res = await fetch(`${API}/chats/${selectedChatId}/messages`, {
                headers: token ? { authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed to fetch messages');
            const json = await res.json() as { messages: Message[] };
            setMessages(json.messages || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }

    async function createNewChat() {
        if (!selectedProjectId) return;
        try {
            const token = getToken();
            const res = await fetch(`${API}/chats`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    ...(token ? { authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    title: 'New Chat'
                })
            });
            if (!res.ok) throw new Error('Failed to create chat');
            const json = await res.json() as { chat: Chat };
            setChats(prev => [json.chat, ...prev]);
            setSelectedChatId(json.chat.id);
        } catch (err) {
            console.error('Error creating chat:', err);
        }
    }

    async function deleteChat(chatId: string) {
        try {
            const token = getToken();
            const res = await fetch(`${API}/chats/${chatId}`, {
                method: 'DELETE',
                headers: token ? { authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Failed to delete chat');
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (selectedChatId === chatId) {
                setSelectedChatId(null);
            }
            setDeleteModalOpen(false);
            setChatToDelete(null);
        } catch (err) {
            console.error('Error deleting chat:', err);
        }
    }

    async function handleSend() {
        if (!input.trim() || !selectedProjectId) return;

        const userContent = input.trim();
        setInput('');
        setLoading(true);

        try {
            const token = getToken();
            const res = await fetch(`${API}/agent/ask`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    ...(token ? { authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    chatId: selectedChatId || undefined,
                    question: userContent
                })
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Failed to get response');
            }

            const data = await res.json() as { answer: string; chatId: string };

            // If no chat was selected, set the returned chatId
            if (!selectedChatId && data.chatId) {
                setSelectedChatId(data.chatId);
                await fetchChats(); // Refresh chat list
            }

            // Fetch updated messages
            await fetchMessages();
        } catch (err: any) {
            console.error('Error sending message:', err);
            // Show error in UI
            const errorMsg: Message = {
                id: 'error_' + Date.now(),
                chat_id: selectedChatId || '',
                role: 'assistant',
                content: `Error: ${err.message || 'Failed to get response. Please try again.'}`,
                created_at: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 60px)' }}>
            {/* Chat History Sidebar */}
            <div style={{ borderRight: '1px solid #1f1f1f', background: '#0a0a0a', padding: 16, overflow: 'auto' }}>
                <div style={{ marginBottom: 16 }}>
                    <Title order={4} c="white" mb={8}>DokAgent</Title>
                    <Select
                        placeholder="Select project"
                        data={projects.map(p => ({ value: p.id, label: p.name }))}
                        value={selectedProjectId}
                        onChange={(value) => {
                            setSelectedProjectId(value || '');
                            setSelectedChatId(null);
                            setMessages([]);
                        }}
                        size="sm"
                        mb={12}
                    />
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={createNewChat}
                        disabled={!selectedProjectId}
                        fullWidth
                        size="sm"
                        variant="light"
                    >
                        New Chat
                    </Button>
                </div>

                <Text c="dimmed" size="xs" mb={8} style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Conversations
                </Text>

                {chats.length === 0 ? (
                    <Text c="dimmed" size="sm" ta="center" mt={24}>
                        No chats yet. Start a new conversation!
                    </Text>
                ) : (
                    <div>
                        {chats.map(chat => (
                            <div
                                key={chat.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 4
                                }}
                            >
                                <NavLink
                                    label={chat.title}
                                    active={selectedChatId === chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    style={{ flex: 1 }}
                                />
                                <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color="red"
                                    onClick={() => {
                                        setChatToDelete(chat.id);
                                        setDeleteModalOpen(true);
                                    }}
                                >
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Interface */}
            <div style={{ display: 'flex', flexDirection: 'column', background: '#0f0f0f', padding: 24 }}>
                {selectedProject && (
                    <Badge color="blue" size="lg" mb={16} style={{ alignSelf: 'flex-start' }}>
                        Context: {selectedProject.name}
                    </Badge>
                )}

                <div
                    ref={scrollRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: 16,
                        background: '#0a0a0a',
                        borderRadius: 8,
                        marginBottom: 16,
                        border: '1px solid #1f1f1f'
                    }}
                >
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: 100 }}>
                            <Text c="dimmed" size="lg">👋 Hi! I'm DokAgent</Text>
                            <Text c="dimmed" size="sm" mt={8}>
                                {selectedChatId ? 'Continue your conversation' : 'Start a new chat or select an existing one'}
                            </Text>
                            {selectedProject && (
                                <Text c="dimmed" size="xs" mt={16}>
                                    Try: "What does this project do?" or "How is authentication implemented?"
                                </Text>
                            )}
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    marginBottom: 16,
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '75%',
                                        padding: '12px 16px',
                                        borderRadius: 12,
                                        background: msg.role === 'user' ? '#2563eb' : '#1f1f1f',
                                        color: msg.role === 'user' ? 'white' : '#e2e8f0'
                                    }}
                                >
                                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {msg.content}
                                    </Text>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af' }}>
                            <Loader size="sm" color="blue" />
                            <Text size="sm" c="dimmed">Thinking...</Text>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <TextInput
                        placeholder="Ask a question about your code..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading || !selectedProjectId}
                        style={{ flex: 1 }}
                        size="md"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || !selectedProjectId}
                        size="md"
                        color="blue"
                    >
                        Send
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setChatToDelete(null);
                }}
                title="Delete Chat"
                centered
            >
                <Text mb={16}>Are you sure you want to delete this chat? This action cannot be undone.</Text>
                <Group justify="flex-end">
                    <Button
                        variant="subtle"
                        onClick={() => {
                            setDeleteModalOpen(false);
                            setChatToDelete(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="red"
                        onClick={() => chatToDelete && deleteChat(chatToDelete)}
                    >
                        Delete
                    </Button>
                </Group>
            </Modal>
        </div>
    );
}
