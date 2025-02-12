import { INPUT_CLASS_NAME, LABEL_CLASS_NAME } from '@/lib/constants';

interface IInputProps {
  label: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: IInputProps) => {
  return (
    <div className="flex flex-col">
      <label className={LABEL_CLASS_NAME}>{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS_NAME}
      />
    </div>
  );
};

export default Input;
