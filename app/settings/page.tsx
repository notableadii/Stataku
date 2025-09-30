"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/skeleton";

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8 rounded-lg" />

          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-6 w-32 rounded" />
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Username"
                value={profile.username}
                isReadOnly
                description="Username cannot be changed after creation"
                startContent={<UserIcon className="w-4 h-4 text-default-400" />}
              />
            </CardBody>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader className="flex items-center gap-3">
              <BellIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-default-500">
                    Receive push notifications
                  </p>
                </div>
                <Switch
                  isSelected={notifications}
                  onValueChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Updates</p>
                  <p className="text-xs text-default-500">
                    Receive email updates about your account
                  </p>
                </div>
                <Switch
                  isSelected={emailUpdates}
                  onValueChange={setEmailUpdates}
                />
              </div>
            </CardBody>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader className="flex items-center gap-3">
              <PaintBrushIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-default-500">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch isSelected={darkMode} onValueChange={setDarkMode} />
              </div>
            </CardBody>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader className="flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Privacy & Security</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Button
                color="primary"
                variant="flat"
                startContent={<GlobeAltIcon className="w-4 h-4" />}
              >
                Change Password
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
