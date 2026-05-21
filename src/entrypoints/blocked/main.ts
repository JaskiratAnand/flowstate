import { mount } from 'svelte';
import BlockedApp from '../../components/BlockedApp.svelte';
import './index.css';

const app = mount(BlockedApp, {
  target: document.getElementById('app')!,
});

export default app;
