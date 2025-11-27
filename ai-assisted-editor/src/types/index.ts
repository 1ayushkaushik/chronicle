export interface AIResponse {
  text: string;
  success: boolean;
}

export interface EditorState {
  text: string;
  isLoading: boolean;
  error: string | null;
}

export interface ContinueButtonProps {
  onClick: () => void;
}