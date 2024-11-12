<script lang="ts">
	import { Button, Checkbox, Heading, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import { EditOutline, TrashBinSolid } from 'flowbite-svelte-icons';
	import { Card, Popover } from 'flowbite-svelte';
	import Customers from '../../data/users.json';
	import type { ComponentType } from 'svelte';
	import LastRange from '../widgets/LastRange.svelte';
	import More from '../widgets/More.svelte';
	import { QuestionCircleSolid } from 'flowbite-svelte-icons';
	import Products from '../../data/product.json';
	import Delete from './Delete.svelte';
	import Product from './Product.svelte';
	
	let hidden: boolean = true; // modal control
	let drawerComponent: ComponentType = Product; // drawer component

	const toggle = (component: ComponentType) => {
		drawerComponent = component;
		hidden = !hidden;
	};
	
	const maxProducts = 9;
	let renderProducts = Products.slice(0, maxProducts);
</script>

<Card size="xl">
	<div class="mb-4 flex items-center gap-2">
		<Heading tag="h3" class="w-fit text-lg font-semibold dark:text-white">
			Statistics this month
		</Heading>
		<button>
			<span class="sr-only">Show information</span>
			<QuestionCircleSolid size="sm" class="text-gray-400 hover:text-gray-500" />
		</button>
		<Popover placement="bottom-start">
			<div class="w-72 space-y-2 text-sm font-normal text-gray-500 dark:text-gray-400">
				<h3 class="font-semibold text-gray-900 dark:text-white">Statistics</h3>
				<p>
					Statistics is a branch of applied mathematics that involves the collection, description,
					analysis, and inference of conclusions from quantitative data.
				</p>
				<More title="Read more" href="#top" flat />
			</div>
		</Popover>
	</div>
	<Table>
		<TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
			<TableHeadCell class="w-4 p-4"><Checkbox /></TableHeadCell>
			{#each ['Product Name', 'Technology', 'Description', 'ID', 'Price', 'Discount', 'Actions'] as title}
				<TableHeadCell class="ps-4 font-normal">{title}</TableHeadCell>
			{/each}
		</TableHead>
		<TableBody>
			{#each renderProducts as product}
				<TableBodyRow class="text-base">
					<TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
					<TableBodyCell class="flex items-center space-x-6 whitespace-nowrap p-4">
						<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
							<div class="text-base font-semibold text-gray-900 dark:text-white">
								{product.name}
							</div>
							<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
								{product.category}
							</div>
						</div>
					</TableBodyCell>
					<TableBodyCell class="p-4">{product.technology}</TableBodyCell>
					<TableBodyCell
						class="max-w-sm overflow-hidden truncate p-4 text-base font-normal text-gray-500 dark:text-gray-400 xl:max-w-xs"
						>{product.description}</TableBodyCell
					>
					<TableBodyCell class="p-4">#{product.id}</TableBodyCell>
					<TableBodyCell class="p-4">{product.price}</TableBodyCell>
					<TableBodyCell class="p-4">{product.discount}</TableBodyCell>
					<TableBodyCell class="space-x-2">
						<Button size="sm" class="gap-2 px-3" on:click={() => toggle(Product)}>
							<EditOutline size="sm" /> Update
						</Button>
						<Button color="red" size="sm" class="gap-2 px-3" on:click={() => toggle(Delete)}>
							<TrashBinSolid size="sm" /> Delete item
						</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
	<div
		class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700 sm:pt-6"
	>
		<LastRange />
		<More title="Full Report" href="#top" />
	</div>
</Card>
