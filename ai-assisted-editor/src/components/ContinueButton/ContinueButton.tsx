import React from 'react';

interface ContinueButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick, isLoading = false }) => {
  return (
    <button
      className="continue-button"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="loading-spinner"></div>
          Generating...
        </>
      ) : (
        <>
          ✨ Continue Writing
        </>
      )}
    </button>
  );
};

export default ContinueButton;