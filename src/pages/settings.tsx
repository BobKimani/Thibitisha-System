import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Layout from '../components/layout/layout';
import { Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <Layout title="Settings" description="Configure system settings and preferences">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">API Base URL</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="https://api.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">API Key</label>
                  <input
                    type="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter API key"
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Validation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Batch Size</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timeout (seconds)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Retry Attempts</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-md"
                    placeholder="3"
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive validation reports via email</div>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Slack Notifications</div>
                    <div className="text-sm text-muted-foreground">Send alerts to Slack channel</div>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                  </div>
                </div>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SettingsPage;