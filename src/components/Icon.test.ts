import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Icon from './Icon.svelte';

describe('Icon Component', () => {
  it('renders a polygon for name="play"', () => {
    const { container } = render(Icon, { name: 'play' });
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '3');
  });

  it('renders paths for name="reset"', () => {
    const { container } = render(Icon, { name: 'reset' });
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
    expect(container.querySelector('svg')).toHaveAttribute(
      'stroke-width',
      '2.5',
    );
  });

  it('applies custom classes', () => {
    const { container } = render(Icon, { name: 'play', class: 'custom-class' });
    expect(container.querySelector('svg')).toHaveClass('custom-class');
  });
});
