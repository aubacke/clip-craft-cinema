
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Folder } from '@/lib/types';
import { StatusIndicator } from './StatusIndicator';
import { SettingsButton } from '@/components/SettingsButton';

interface PageHeaderProps {
  selectedFolderId: string | null;
  folders: Folder[];
  onToggleSidebar: () => void;
  onCreateNewVideo: () => void;
  showGenerator: boolean;
  processingVideosCount?: number;
  completedVideosCount?: number;
  onClickProcessing?: () => void;
  onClickCompleted?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  selectedFolderId,
  folders,
  onToggleSidebar,
  onCreateNewVideo,
  showGenerator,
  processingVideosCount = 0,
  completedVideosCount = 0,
  onClickProcessing,
  onClickCompleted
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
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
      </div>
      
      <div className="flex items-center gap-3">
        <StatusIndicator 
          processingCount={processingVideosCount}
          completedCount={completedVideosCount}
          onClickProcessing={onClickProcessing}
          onClickCompleted={onClickCompleted}
        />
        
        {/* Settings Button */}
        <SettingsButton />
        
        {!showGenerator && (
          <Button onClick={onCreateNewVideo}>
            Create New Video
          </Button>
        )}
      </div>
    </div>
  );
};
