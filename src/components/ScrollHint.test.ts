import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ScrollHint from './ScrollHint.svelte';

describe('ScrollHint Component', () => {
  it('renders correctly when show is true', () => {
    const { container, queryByText } = render(ScrollHint, { show: true });
    expect(queryByText('Scroll')).toBeInTheDocument();
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    const { queryByText } = render(ScrollHint, { show: false });
    expect(queryByText('Scroll')).not.toBeInTheDocument();
  });
});
