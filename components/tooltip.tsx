import { Tooltip as ReactTooltip, ITooltip } from 'react-tooltip';

interface IIncomingProps extends ITooltip {
  id: string;
  children: React.ReactNode;
}

const Tooltip = ({ offset = 10, ...rest }: IIncomingProps) => {
  return (
    <a data-tooltip-id={rest.id}>
      {rest.children}

      <ReactTooltip
        {...rest}
        id={rest.id}
        offset={offset}
        opacity={1}
        style={{ maxWidth: 300, zIndex: 10000, borderRadius: 10 }}
      />
    </a>
  );
};

export default Tooltip;
