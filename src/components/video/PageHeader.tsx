
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Folder } from '@/lib/types';

interface PageHeaderProps {
  selectedFolderId: string | null;
  folders: Folder[];
  onToggleSidebar: () => void;
  onCreateNewVideo: () => void;
  showGenerator: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  selectedFolderId,
  folders,
  onToggleSidebar,
  onCreateNewVideo,
  showGenerator
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Button 
        variant="outline" 
        size="icon"
        className="md:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <h1 className="text-2xl font-bold ml-2 md:ml-0">
        {selectedFolderId 
          ? `Folder: ${folders.find(f => f.id === selectedFolderId)?.name}`
          : 'All Videos'}
      </h1>
      
      <div className="flex gap-2">
        {!showGenerator && (
          <Button onClick={onCreateNewVideo}>
            Create New Video
          </Button>
        )}
      </div>
    </div>
  );
};
