import { UserComponent, useNode } from '@craftjs/core';
import cx from 'classnames';
import { styled } from 'styled-components';

import { ButtonSettings } from './ButtonSettings';

import { Text } from '../Text';

type ButtonProps = {
  background?: Record<'r' | 'g' | 'b' | 'a', number>;
  color?: Record<'r' | 'g' | 'b' | 'a', number>;
  buttonStyle?: string;
  margin?: (number | string)[];
  text?: string;
  textComponent?: any;
};

// Alias required StyledComponent props for Transient Props
type StyledButtonProps = {
  $background?: Record<'r' | 'g' | 'b' | 'a', number>;
  $buttonStyle?: string;
  $margin?: (number | string)[];
};

const StyledButton = styled.button<StyledButtonProps>`
  background: ${(props) =>
    props.$buttonStyle === 'full' && props.$background
      ? `rgba(${Object.values(props.$background).join(', ')})`
      : 'transparent'};
  border: 2px solid transparent;
  border-color: ${(props) =>
    props.$buttonStyle === 'outline' && props.$background
      ? `rgba(${Object.values(props.$background).join(', ')})`
      : 'transparent'};
  margin: ${({ $margin }) =>
    $margin && $margin.length === 4
      ? `${$margin[0]}px ${$margin[1]}px ${$margin[2]}px ${$margin[3]}px`
      : '0'};
`;

export const Button: UserComponent<ButtonProps> = ({
  text,
  textComponent,
  color,
  buttonStyle,
  background,
  margin,
}: ButtonProps) => {
  const {
    connectors: { connect },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <StyledButton
      ref={(dom) => {
        if (dom) connect(dom);
      }}
      className={cx([
        'rounded w-full px-4 py-2',
        {
          'shadow-lg': buttonStyle === 'full',
        },
      ])}
      $buttonStyle={buttonStyle}
      $background={background}
      $margin={margin}
    >
      <Text {...textComponent} text={text} color={color} />
    </StyledButton>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    background: { r: 255, g: 255, b: 255, a: 0.5 },
    color: { r: 92, g: 90, b: 90, a: 1 },
    buttonStyle: 'full',
    text: 'Button',
    margin: [5, 0, 5, 0],
    textComponent: {
      ...Text.craft.props,
      textAlign: 'center',
    },
  },
  related: {
    toolbar: ButtonSettings,
  },
};
