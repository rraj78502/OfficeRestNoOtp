import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, FileText, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ContentItem {
  key: string;
  page: string;
  section: string;
  title?: string;
  content: string;
  type: string;
  order: number;
  isActive: boolean;
}

const ContentManagement = () => {
  const { toast } = useToast();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});
  const [activePage, setActivePage] = useState<string>('home');
  const [showInitDialog, setShowInitDialog] = useState(false);

  const pages = [
    { value: 'home', label: 'Home Page' },
    { value: 'about', label: 'About Page' },
    { value: 'events', label: 'Events Page' },
    { value: 'gallery', label: 'Gallery Page' },
    { value: 'contact', label: 'Contact Page' },
    { value: 'login', label: 'Login Page' },
    { value: 'footer', label: 'Footer' },
  ];

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/content/get-all`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setContents(response.data.data);
        // Initialize edited contents
        const initial: Record<string, string> = {};
        response.data.data.forEach((item: ContentItem) => {
          initial[item.key] = item.content;
        });
        setEditedContents(initial);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      console.log('Initializing defaults...');
      setSaving(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/content/initialize-defaults`,
        {},
        { withCredentials: true }
      );
      
      console.log('Initialize defaults response:', response.data);
      
      // Handle different response structures
      const responseData = response.data;
      const isSuccess = responseData?.success !== false && response.status >= 200 && response.status < 300;
      const results = responseData?.data || [];
      
      if (isSuccess) {
        const created = results.filter((r: any) => r.action === 'created').length;
        const skipped = results.filter((r: any) => r.action === 'skipped').length;
        const errors = results.filter((r: any) => r.success === false).length;
        
        let description = `Initialized ${created} new content item(s)`;
        if (skipped > 0) description += `, ${skipped} already existed`;
        if (errors > 0) description += `, ${errors} failed`;
        
        toast({
          title: 'Success',
          description: description,
        });
        // Refresh the content list
        await fetchContents();
      } else {
        toast({
          title: 'Error',
          description: responseData?.message || 'Failed to initialize defaults',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Initialize defaults error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to initialize defaults. Please check console for details.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (key: string, value: string) => {
    setEditedContents((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveContent = async (key: string) => {
    const content = contents.find((c) => c.key === key);
    if (!content) return;

    const newContent = editedContents[key];
    if (newContent === content.content) {
      toast({
        title: 'No changes',
        description: 'No changes to save',
      });
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/content/upsert`,
        {
          key,
          page: content.page,
          section: content.section,
          title: content.title,
          content: newContent,
          type: content.type,
          order: content.order,
          isActive: content.isActive,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Content saved successfully',
        });
        fetchContents();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAllPageContent = async () => {
    const pageContents = contents.filter((c) => c.page === activePage);
    const updates = pageContents
      .filter((c) => editedContents[c.key] !== c.content)
      .map((c) => ({
        key: c.key,
        page: c.page,
        section: c.section,
        title: c.title,
        content: editedContents[c.key],
        type: c.type,
        order: c.order,
        isActive: c.isActive,
      }));

    if (updates.length === 0) {
      toast({
        title: 'No changes',
        description: 'No changes to save',
      });
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/content/update-multiple`,
        { contents: updates },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Saved ${updates.length} content item(s) successfully`,
        });
        fetchContents();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getPageContents = (page: string) => {
    return contents.filter((c) => c.page === page).sort((a, b) => {
      if (a.section !== b.section) {
        return a.section.localeCompare(b.section);
      }
      return a.order - b.order;
    });
  };

  const groupBySection = (items: ContentItem[]) => {
    const grouped: Record<string, ContentItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.section]) {
        grouped[item.section] = [];
      }
      grouped[item.section].push(item);
    });
    return grouped;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  const pageContents = getPageContents(activePage);
  const groupedContents = groupBySection(pageContents);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1E4E9D] mb-2">Content Management</h1>
            <p className="text-gray-600">Manage all static content across the website</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInitDialog(true)}
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Initialize Defaults
            </Button>
            <Button onClick={saveAllPageContent} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save All ({activePage})
            </Button>
          </div>
        </div>

        <Tabs value={activePage} onValueChange={setActivePage}>
          <TabsList className="grid w-full grid-cols-7">
            {pages.map((page) => (
              <TabsTrigger key={page.value} value={page.value}>
                {page.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {pages.map((page) => (
            <TabsContent key={page.value} value={page.value} className="space-y-6">
              {Object.keys(groupedContents).length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      No content found for {page.label}. Click "Initialize Defaults" to create default content.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(groupedContents).map(([section, items]) => (
                  <Card key={section}>
                    <CardHeader>
                      <CardTitle className="capitalize">{section.replace(/_/g, ' ')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item) => (
                        <div key={item.key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={item.key} className="font-semibold">
                              {item.title || item.key.replace(/_/g, ' ')}
                            </Label>
                            <Button
                              size="sm"
                              onClick={() => saveContent(item.key)}
                              disabled={saving || editedContents[item.key] === item.content}
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <Textarea
                            id={item.key}
                            value={editedContents[item.key] || ''}
                            onChange={(e) => handleContentChange(item.key, e.target.value)}
                            rows={item.type === 'text' ? 3 : 6}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Key: {item.key} | Type: {item.type}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Initialize Defaults Confirmation Dialog */}
        <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initialize Default Content</DialogTitle>
              <DialogDescription>
                This will create default content entries for all pages. Existing content will not be overwritten - only new entries will be created.
                <br />
                <br />
                Do you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInitDialog(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setShowInitDialog(false);
                  await initializeDefaults();
                }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Initialize'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ContentManagement;

