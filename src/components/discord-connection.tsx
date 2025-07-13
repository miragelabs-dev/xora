"use client";

import { api } from "@/utils/api";
import { AlertCircle, Link, Loader2, Shield, Unlink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function DiscordConnection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const { data: connectionStatus, refetch, isLoading } = api.discord.getConnectionStatus.useQuery();
    const { data: authUrl } = api.discord.getAuthUrl.useQuery();

    const handleCallback = api.discord.handleCallback.useMutation({
        onSuccess: (data) => {
            setMessage({
                type: 'success',
                text: `Discord account (@${data.discordUser.username}) connected successfully!`
            });
            refetch();
            router.replace(window.location.pathname);
        },
        onError: (error) => {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to connect Discord account'
            });
        },
        onSettled: () => {
            setIsProcessing(false);
        },
    });

    const disconnect = api.discord.disconnect.useMutation({
        onSuccess: () => {
            setMessage({
                type: 'success',
                text: 'Discord account disconnected successfully!'
            });
            refetch();
        },
        onError: (error) => {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to disconnect Discord account'
            });
        },
    });

    useEffect(() => {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            setMessage({
                type: 'error',
                text: 'Discord authorization was cancelled'
            });
            router.replace(window.location.pathname);
            return;
        }

        if (code && !isProcessing) {
            setIsProcessing(true);
            handleCallback.mutate({ code });
        }
    }, [searchParams]);

    const handleConnect = () => {
        if (authUrl?.url) {
            window.location.href = authUrl.url;
        }
    };

    const handleDisconnect = () => {
        if (confirm("Are you sure you want to disconnect your Discord account?")) {
            disconnect.mutate();
        }
    };

    const isConnected = connectionStatus?.isConnected && connectionStatus?.discordUser;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Discord Connection
                </CardTitle>
                <CardDescription>
                    Connect your Discord account to unlock additional features
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}
                        className={message.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
                        <AlertCircle className={`h-4 w-4 ${message.type === 'success' ? '!text-green-600' : ''}`} />
                        <AlertDescription className={message.type === 'success' ? '!text-green-800' : ''}>
                            {message.text}
                        </AlertDescription>
                    </Alert>
                )}

                {isProcessing && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Connecting to Discord...</span>
                    </div>
                )}

                {isLoading ? (
                    <LoadingSkeleton />
                ) : connectionStatus && !isProcessing ? (
                    <div className="space-y-3">
                        {isConnected ? (
                            <ConnectedView
                                discordUser={connectionStatus.discordUser! as { id: string; username: string; avatar?: string }}
                                onDisconnect={handleDisconnect}
                                isDisconnecting={disconnect.isPending}
                            />
                        ) : (
                            <DisconnectedView
                                onConnect={handleConnect}
                                isLoading={isProcessing}
                            />
                        )}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-20" />
            </div>
            <div className="p-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
            </div>
        </div>
    );
}

interface ConnectedViewProps {
    discordUser: {
        id: string;
        username: string;
        avatar?: string;
    };
    onDisconnect: () => void;
    isDisconnecting: boolean;
}

function ConnectedView({
    discordUser,
    onDisconnect,
    isDisconnecting
}: ConnectedViewProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connected
                </Badge>
            </div>

            <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                    {discordUser.avatar && (
                        <img
                            src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=32`}
                            alt="Discord Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <div>
                        <p className="text-sm font-medium">
                            @{discordUser.username}
                        </p>
                        <p className="text-xs text-gray-500">
                            ID: {discordUser.id}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDisconnect}
                    disabled={isDisconnecting}
                    className="flex items-center gap-2"
                >
                    {isDisconnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Unlink className="h-4 w-4" />
                    )}
                    Disconnect
                </Button>
            </div>
        </div>
    );
}

interface DisconnectedViewProps {
    onConnect: () => void;
    isLoading: boolean;
}

function DisconnectedView({ onConnect, isLoading }: DisconnectedViewProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="outline">Not Connected</Badge>
            </div>

            <Button
                onClick={onConnect}
                className="w-full flex items-center gap-2"
                disabled={isLoading}
            >
                <Link className="h-4 w-4" />
                Connect with Discord
            </Button>
        </div>
    );
}