import { User, Building, Loader2, X } from "lucide-react";
import { usePresignedUrl } from "../../hooks/usePresignedUrl";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { User as UserType } from '../../types/user';
import type { CandidateProfile } from "../../types/candidate";

interface AvatarProps {
  user?: Partial<UserType> | null;
  candidate?: Partial<CandidateProfile> | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar = ({
  user,
  candidate,
  name: nameOverride,
  size = "md",
}: AvatarProps) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isAgency = !!(user?.ownedAgencies && user.ownedAgencies.length > 0);
  const imageKey = isAgency ? user?.ownedAgencies?.[0]?.logoKey : (user?.avatarKey || candidate?.user?.avatarKey);
  
  const name = nameOverride || 
               (isAgency ? user?.ownedAgencies?.[0]?.name : (
                 (candidate ? `${candidate.firstName} ${candidate.lastName}` : (
                   user?.candidateProfile ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}` : user?.email
                 ))
               )) || '';
  
  const iconType = isAgency ? 'agency' : 'user';
  const { url, isLoading } = usePresignedUrl(imageKey);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
    xl: "h-24 w-24 text-3xl",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const FallbackIcon = iconType === "agency" ? Building : User;
  const isClickable = ['lg', 'xl'].includes(size);

  const handleAvatarClick = () => {
    if (url) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (isModalOpen) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsModalOpen(false);
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isModalOpen]);

  const ModalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/25 dark:bg-black/70 backdrop-blur-sm"
      onClick={handleCloseModal}
    >
      <div 
        className="relative z-[9999] max-w-4xl max-h-full overflow-auto px-4 sm:px-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={url!}
            alt={name || "Enlarged Profile"}
            className="w-full max-h-[80vh] object-contain rounded-full"
          />
          <button
            onClick={handleCloseModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 z-[10000] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`flex-shrink-0 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden rounded-full ${
          isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
        } ${sizeClasses[size]}`}
        onClick={isClickable ? handleAvatarClick : undefined}
      >
        {isLoading ? (
          <Loader2
            className={`animate-spin text-gray-400 ${iconSizeClasses[size]}`}
          />
        ) : url ? (
          <img
            src={url}
            alt={name || "Profile"}
            className="w-full h-full object-cover rounded-full"
          />
        ) : initials ? (
          <span className="font-bold text-gray-500 dark:text-zinc-400">
            {initials}
          </span>
        ) : (
          <FallbackIcon
            className={`text-gray-400 dark:text-zinc-500 ${iconSizeClasses[size]}`}
          />
        )}
      </div>

      {isModalOpen && createPortal(ModalContent, document.body)}
    </>
  );
};
