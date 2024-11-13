<script lang="ts">
    import BabylonPanel from '../../../utils/dashboard/BabylonPanel.svelte';
    import MetaTag from '../../../utils/MetaTag.svelte';
    import Footer from '../../Footer.svelte';
    import type { PageData } from './$types';
    export let data: PageData;
    
    const path: string = '/layouts/sidebar';
  const description: string = 'Sidebar layout examaple - Flowbite Svelte Admin Dashboard';
  const title: string = 'Flowbite Svelte Admin Dashboard - Sidebar Layout';
  const subtitle: string = 'Sidebar Layout';
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="p-4">
    <BabylonPanel {data} />
</main>
<Footer />