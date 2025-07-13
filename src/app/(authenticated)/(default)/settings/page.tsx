"use client";

import DiscordConnection from "@/components/discord-connection";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("integrations");

    const tabs = [
        { id: "integrations", label: "Integrations", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="lg:col-span-1 h-fit">
                        <CardContent className="p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-3 space-y-6">
                        {activeTab === "integrations" && (
                            <div className="space-y-6">
                                <DiscordConnection />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}