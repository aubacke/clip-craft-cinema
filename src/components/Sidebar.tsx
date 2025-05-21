
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FolderPlus, Plus, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Folder } from '@/lib/types';
import { VIDEO_MODELS } from '@/lib/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  folders: Folder[];
  onCreateFolder: (name: string) => void;
  onNewVideo: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedFolderId,
  onSelectFolder,
  folders,
  onCreateFolder,
  onNewVideo
}) => {
  const [newFolderName, setNewFolderName] = React.useState('');
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  // Separate regular folders from reference image folders
  const regularFolders = folders.filter(folder => !folder.isReferenceFolder);
  const referenceImageFolders = folders.filter(folder => folder.isReferenceFolder);

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-30 h-full w-64 bg-sidebar transform transition-transform duration-300 ease-in-out shadow-xl',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-sidebar-foreground">Video Generator</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden" 
            onClick={onClose}
          >
            &times;
          </Button>
        </div>
        
        <Button 
          className="w-full mb-6 bg-sidebar-primary hover:bg-sidebar-primary/80 text-sidebar-primary-foreground"
          onClick={onNewVideo}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Video
        </Button>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-sidebar-foreground/70">Folders</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCreatingFolder(!isCreatingFolder)}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          
          {isCreatingFolder && (
            <div className="mb-2 flex">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="text-xs h-8 mr-1"
              />
              <Button size="sm" className="h-8" onClick={handleCreateFolder}>Add</Button>
            </div>
          )}
          
          <Button
            variant={selectedFolderId === null ? "default" : "outline"}
            size="sm"
            className="w-full justify-start mb-1 text-sm"
            onClick={() => onSelectFolder(null)}
          >
            All Videos
          </Button>
          
          {regularFolders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolderId === folder.id ? "default" : "outline"}
              size="sm"
              className="w-full justify-start mb-1 text-sm"
              onClick={() => onSelectFolder(folder.id)}
            >
              {folder.name}
            </Button>
          ))}
        </div>
        
        {referenceImageFolders.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <h3 className="text-sm font-medium text-sidebar-foreground/70">Reference Images</h3>
            </div>
            
            {referenceImageFolders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolderId === folder.id ? "default" : "outline"}
                size="sm"
                className="w-full justify-start mb-1 text-sm"
                onClick={() => onSelectFolder(folder.id)}
              >
                <Image className="mr-2 h-4 w-4" />
                {folder.name}
              </Button>
            ))}
          </div>
        )}
        
        <div className="mt-auto">
          <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-2">Available Models</h3>
          <div className="space-y-1 text-xs text-sidebar-foreground/70">
            {VIDEO_MODELS.map((model) => (
              <div key={model.id} className="p-2 rounded-md bg-sidebar-accent">
                <div className="font-medium">{model.name}</div>
                <div className="text-xs opacity-70">{model.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
