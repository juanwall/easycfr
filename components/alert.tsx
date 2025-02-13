import { InformationCircleIcon } from '@heroicons/react/20/solid';

interface IProps {
  message: string;
}

const Alert = ({ message }: IProps) => {
  return (
    <div className="rounded-md bg-indigo-50 p-4">
      <div className="flex">
        <div className="shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="size-5 text-indigo-400"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-indigo-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
