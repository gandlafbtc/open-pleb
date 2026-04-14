<script lang="ts">
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";

	interface Props {
		value: string;
		onchange: (regex: string) => void;
	}

	let { value = $bindable(""), onchange }: Props = $props();

	type PatternType = "starts_with" | "ends_with" | "contains" | "exact" | "length" | "min_length" | "max_length" | "alphanumeric" | "alphabetic" | "numeric" | "custom";
	type Operator = "AND" | "OR";

	interface RuleItem {
		id: number;
		itemType: "rule";
		type: PatternType;
		pattern: string;
		negated: boolean;
	}

	interface GroupItem {
		id: number;
		itemType: "group";
		operator: Operator;
		negated: boolean;
		children: (RuleItem | GroupItem)[];
	}

	type Item = RuleItem | GroupItem;

	let nextId = $state(Date.now());
	let testAddress = $state("");

	// Initialize with root group containing one empty rule
	let rootGroup = $state<GroupItem>({
		id: nextId++,
		itemType: "group",
		operator: "AND",
		negated: false,
		children: [
			{
				id: nextId++,
				itemType: "rule",
				type: "starts_with",
				pattern: "",
				negated: false
			}
		]
	});

	const patternOptions = [
		{ value: "starts_with", label: "Starts with" },
		{ value: "ends_with", label: "Ends with" },
		{ value: "contains", label: "Contains" },
		{ value: "exact", label: "Exact match" },
		{ value: "length", label: "Length equals" },
		{ value: "min_length", label: "Min length" },
		{ value: "max_length", label: "Max length" },
		{ value: "alphanumeric", label: "Alphanumeric only" },
		{ value: "alphabetic", label: "Alphabetic only" },
		{ value: "numeric", label: "Numeric only" },
		{ value: "custom", label: "Custom regex" }
	];

	function isRule(item: Item): item is RuleItem {
		return item.itemType === "rule";
	}

	function isGroup(item: Item): item is GroupItem {
		return item.itemType === "group";
	}

	function buildRegexForRule(rule: RuleItem): string {
		// For pattern types that don't need input, allow empty pattern
		const needsPattern = !["alphanumeric", "alphabetic", "numeric"].includes(rule.type);
		if (needsPattern && !rule.pattern.trim()) return "";
		
		const escaped = rule.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		let pattern = "";
		switch (rule.type) {
			case "starts_with":
				pattern = `^${escaped}`;
				break;
			case "ends_with":
				pattern = `${escaped}$`;
				break;
			case "contains":
				pattern = `.*${escaped}.*`;
				break;
			case "exact":
				pattern = `^${escaped}$`;
				break;
			case "length": {
				// Exact length: match exactly N characters
				const len = parseInt(rule.pattern);
				if (isNaN(len) || len < 0) return "";
				pattern = `^.{${len}}$`;
				break;
			}
			case "min_length": {
				// Minimum length: match at least N characters
				const minLen = parseInt(rule.pattern);
				if (isNaN(minLen) || minLen < 0) return "";
				pattern = `^.{${minLen},}$`;
				break;
			}
			case "max_length": {
				// Maximum length: match at most N characters
				const maxLen = parseInt(rule.pattern);
				if (isNaN(maxLen) || maxLen < 0) return "";
				pattern = `^.{0,${maxLen}}$`;
				break;
			}
			case "alphanumeric":
				// Only letters and numbers
				pattern = `^[a-zA-Z0-9]+$`;
				break;
			case "alphabetic":
				// Only letters
				pattern = `^[a-zA-Z]+$`;
				break;
			case "numeric":
				// Only numbers
				pattern = `^[0-9]+$`;
				break;
			case "custom":
				pattern = rule.pattern; // Don't escape custom regex
				break;
			default:
				pattern = escaped;
		}
		
		// Apply negation using negative lookahead followed by match-all
		// This ensures the pattern doesn't match, then matches the string
		if (rule.negated) {
			// For anchored patterns (^ or $), we need special handling
			if (pattern.startsWith('^') && pattern.endsWith('$')) {
				// Exact match negation: match anything that's not exactly this
				return `^(?!${pattern.slice(1, -1)}$).*$`;
			} else if (pattern.startsWith('^')) {
				// Starts with negation: match anything that doesn't start with this
				return `^(?!${pattern.slice(1)}).*`;
			} else if (pattern.endsWith('$')) {
				// Ends with negation: match anything that doesn't end with this
				return `^(?!.*${pattern.slice(0, -1)}$).*`;
			} else {
				// Contains negation: match anything that doesn't contain this
				return `^(?!.*${pattern}).*$`;
			}
		}
		return pattern;
	}

	function buildRegexForGroup(group: GroupItem): string {
		const childPatterns = group.children
			.map(child => {
				if (isRule(child)) {
					// buildRegexForRule already handles negation
					return buildRegexForRule(child);
				} else {
					return buildRegexForGroup(child);
				}
			})
			.filter(pattern => pattern.length > 0);

		if (childPatterns.length === 0) return "";
		
		let result = "";
		if (childPatterns.length === 1) {
			result = childPatterns[0];
		} else if (group.operator === "OR") {
			// OR: Use alternation
			result = `(?:${childPatterns.join("|")})`;
		} else {
			// AND: Use positive lookaheads
			const lookaheads = childPatterns.map(p => `(?=${p})`).join("");
			result = `${lookaheads}.*`;
		}
		
		// Apply group negation
		if (group.negated && result) {
			return `(?!${result})`;
		}
		return result;
	}

	function buildRegex(): string {
		return buildRegexForGroup(rootGroup);
	}

	function updateRegex() {
		const regex = buildRegex();
		value = regex;
		onchange(regex);
	}

	function findGroupById(group: GroupItem, targetId: number): GroupItem | null {
		if (group.id === targetId) return group;
		
		for (const child of group.children) {
			if (isGroup(child)) {
				const found = findGroupById(child, targetId);
				if (found) return found;
			}
		}
		return null;
	}

	function addRule(parentId: number) {
		const parent = findGroupById(rootGroup, parentId);
		if (parent) {
			parent.children.push({
				id: nextId++,
				itemType: "rule",
				type: "starts_with",
				pattern: "",
				negated: false
			});
			rootGroup = rootGroup; // Trigger reactivity
		}
	}

	function addGroup(parentId: number) {
		const parent = findGroupById(rootGroup, parentId);
		if (parent) {
			parent.children.push({
				id: nextId++,
				itemType: "group",
				operator: "AND",
				negated: false,
				children: [
					{
						id: nextId++,
						itemType: "rule",
						type: "starts_with",
						pattern: "",
						negated: false
					}
				]
			});
			rootGroup = rootGroup; // Trigger reactivity
		}
	}

	function removeItem(parentGroup: GroupItem, itemId: number) {
		// Don't allow removing the last item from root
		if (parentGroup.id === rootGroup.id && parentGroup.children.length === 1) {
			return;
		}
		
		parentGroup.children = parentGroup.children.filter(child => child.id !== itemId);
		rootGroup = rootGroup; // Trigger reactivity
		updateRegex();
	}

	function removeItemFromGroup(group: GroupItem, itemId: number): boolean {
		// Check if item is direct child
		const index = group.children.findIndex(child => child.id === itemId);
		if (index !== -1) {
			removeItem(group, itemId);
			return true;
		}
		
		// Recursively search in child groups
		for (const child of group.children) {
			if (isGroup(child)) {
				if (removeItemFromGroup(child, itemId)) {
					return true;
				}
			}
		}
		return false;
	}

	function handleRemove(itemId: number) {
		removeItemFromGroup(rootGroup, itemId);
	}

	function updateOperator(groupId: number, operator: Operator) {
		const group = findGroupById(rootGroup, groupId);
		if (group) {
			group.operator = operator;
			rootGroup = rootGroup; // Trigger reactivity
			updateRegex();
		}
	}

	function testRegex(): boolean {
		if (!value || !testAddress) return false;
		try {
			const regex = new RegExp(value);
			return regex.test(testAddress);
		} catch {
			return false;
		}
	}

	let isMatch = $derived(testRegex());
</script>

<div class="space-y-4">
	<div class="space-y-3">
		<Label>Pattern Rules</Label>
		
		{#snippet renderGroup(group: GroupItem, depth: number)}
			<div 
				class="space-y-2 p-3 rounded-md border border-border/50"
				style="margin-left: {depth * 1.5}rem;"
			>
				<!-- Group operator selector -->
				<div class="flex items-center gap-2 mb-2">
					<Button
						variant={group.negated ? "destructive" : "outline"}
						size="sm"
						onclick={() => {
							group.negated = !group.negated;
							rootGroup = rootGroup;
							updateRegex();
						}}
						class="h-8 w-8 p-0 text-sm font-bold"
						title={group.negated ? "Negated (NOT)" : "Click to negate"}
					>
						!
					</Button>
					<span class="text-xs text-muted-foreground font-medium">Combine with:</span>
					<select
						bind:value={group.operator}
						onchange={() => updateOperator(group.id, group.operator)}
						class="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						<option value="AND">AND</option>
						<option value="OR">OR</option>
					</select>
				</div>

				<!-- Render children -->
				{#each group.children as item, index (item.id)}
					{#if index > 0}
						<div class="flex items-center gap-2 my-1">
							<div class="flex-1 border-t border-border/30"></div>
							<span class="text-xs font-medium text-muted-foreground px-2">
								{group.operator}
							</span>
							<div class="flex-1 border-t border-border/30"></div>
						</div>
					{/if}

					{#if isRule(item)}
						<!-- Rule UI -->
						<div class="flex gap-2 items-end">
							<Button
								variant={item.negated ? "destructive" : "outline"}
								size="icon"
								onclick={() => {
									item.negated = !item.negated;
									rootGroup = rootGroup;
									updateRegex();
								}}
								class="h-10 w-10 text-sm font-bold"
								title={item.negated ? "Negated (NOT)" : "Click to negate"}
							>
								!
							</Button>
							<div class="flex-1">
								<select
									bind:value={item.type}
									onchange={updateRegex}
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								>
									{#each patternOptions as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
							<div class="flex-1">
								<Input
									type="text"
									placeholder={
										item.type === "custom" ? "Enter regex pattern" :
										item.type === "length" ? "Enter length (e.g., 42)" :
										item.type === "min_length" ? "Enter min length (e.g., 10)" :
										item.type === "max_length" ? "Enter max length (e.g., 100)" :
										item.type === "alphanumeric" ? "No input needed" :
										item.type === "alphabetic" ? "No input needed" :
										item.type === "numeric" ? "No input needed" :
										"Enter pattern"
									}
									bind:value={item.pattern}
									oninput={updateRegex}
									disabled={["alphanumeric", "alphabetic", "numeric"].includes(item.type)}
								/>
							</div>
							<Button
								variant="outline"
								size="icon"
								onclick={() => handleRemove(item.id)}
								disabled={group.id === rootGroup.id && group.children.length === 1}
							>
								✕
							</Button>
						</div>
					{:else}
						<!-- Nested Group -->
						{@render renderGroup(item, depth + 1)}
						<div class="flex justify-end mt-1">
							<Button
								variant="ghost"
								size="sm"
								onclick={() => handleRemove(item.id)}
								class="h-7 text-xs"
							>
								Remove Group
							</Button>
						</div>
					{/if}
				{/each}

				<!-- Add buttons -->
				<div class="flex gap-2 mt-3">
					<Button 
						variant="outline" 
						size="sm" 
						onclick={() => addRule(group.id)}
						class="text-xs"
					>
						+ Add Rule
					</Button>
					<Button 
						variant="outline" 
						size="sm" 
						onclick={() => addGroup(group.id)}
						class="text-xs"
					>
						+ Add Group
					</Button>
				</div>
			</div>
		{/snippet}

		{@render renderGroup(rootGroup, 0)}
	</div>

	<div class="space-y-2">
		<Label>Generated Regex</Label>
		<Input
			type="text"
			readonly
			value={value}
			class="font-mono text-sm bg-muted"
		/>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-sm">Test Pattern</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-2">
			<Input
				type="text"
				placeholder="Enter test address"
				bind:value={testAddress}
			/>
			{#if testAddress && value}
				<div class="text-sm">
					{#if isMatch}
						<span class="text-green-600 font-medium">✓ Match</span>
					{:else}
						<span class="text-red-600 font-medium">✗ No match</span>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
