<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
	import { Switch } from "$lib/components/ui/switch";
	import { Badge } from "$lib/components/ui/badge";
	import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Separator } from "$lib/components/ui/separator";
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
	import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Spinner } from "$lib/components/ui/spinner";
	import { Progress } from "$lib/components/ui/progress";
	import { Toggle } from "$lib/components/ui/toggle";
	import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "$lib/components/ui/breadcrumb";
	import DarkmodeToggle from "$lib/components/ui/custom/DarkmodeToggle.svelte";
	
	let checked = $state(false);
	let switchValue = $state(false);
	let sliderValue = $state([50]);
	let radioValue = $state("option1");
	let progressValue = $state(60);
</script>
<DarkmodeToggle></DarkmodeToggle>
<div class="container mx-auto p-8 space-y-12">
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">shadcn-svelte Component Showcase</h1>
		<p class="text-muted-foreground">A comprehensive display of all available components and their variants</p>
	</div>

	<!-- Buttons -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Buttons</h2>
			<p class="text-sm text-muted-foreground mb-4">Different button variants and sizes</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Button Variants</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex flex-wrap gap-2">
					<Button>Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="link">Link</Button>
				</div>
				
				<Separator />
				
				<div class="space-y-2">
					<h3 class="text-sm font-medium">Sizes</h3>
					<div class="flex flex-wrap items-center gap-2">
						<Button size="sm">Small</Button>
						<Button size="default">Default</Button>
						<Button size="lg">Large</Button>
						<Button size="icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Form Components -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Form Components</h2>
			<p class="text-sm text-muted-foreground mb-4">Input fields and form controls</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Input Fields</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="email@example.com" />
				</div>
				
				<div class="space-y-2">
					<Label for="message">Message</Label>
					<Textarea id="message" placeholder="Type your message here..." />
				</div>
				
				<Separator />
				
				<div class="flex items-center space-x-2">
					<Checkbox id="terms" bind:checked />
					<Label for="terms">Accept terms and conditions</Label>
				</div>
				
				<Separator />
				
				<div class="space-y-2">
					<Label>Radio Group</Label>
					<RadioGroup bind:value={radioValue}>
						<div class="flex items-center space-x-2">
							<RadioGroupItem value="option1" id="option1" />
							<Label for="option1">Option 1</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroupItem value="option2" id="option2" />
							<Label for="option2">Option 2</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroupItem value="option3" id="option3" />
							<Label for="option3">Option 3</Label>
						</div>
					</RadioGroup>
				</div>
				
				<Separator />
				
				<div class="flex items-center space-x-2">
					<Switch id="airplane-mode" bind:checked={switchValue} />
					<Label for="airplane-mode">Airplane Mode</Label>
				</div>
				
				<Separator />
				
				<div class="space-y-2">
					<Label>Slider</Label>
					<!-- <Slider bind:value={sliderValue} max={100} step={1} /> -->
					<p class="text-sm text-muted-foreground">Value: {sliderValue[0]}</p>
				</div>
				
				<Separator />
				
				<div class="flex items-center space-x-2">
					<Toggle>Toggle</Toggle>
					<Toggle pressed>Pressed</Toggle>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Badges -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Badges</h2>
			<p class="text-sm text-muted-foreground mb-4">Status indicators and labels</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Badge Variants</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-wrap gap-2">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Alerts -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Alerts</h2>
			<p class="text-sm text-muted-foreground mb-4">Contextual feedback messages</p>
		</div>
		
		<div class="space-y-4">
			<Alert>
				<AlertTitle>Default Alert</AlertTitle>
				<AlertDescription>This is a default alert message.</AlertDescription>
			</Alert>
			
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>Something went wrong. Please try again.</AlertDescription>
			</Alert>
		</div>
	</section>

	<!-- Cards -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Cards</h2>
			<p class="text-sm text-muted-foreground mb-4">Content containers</p>
		</div>
		
		<div class="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card description goes here</CardDescription>
				</CardHeader>
				<CardContent>
					<p>This is the card content area.</p>
				</CardContent>
				<CardFooter>
					<Button>Action</Button>
				</CardFooter>
			</Card>
			
			<Card>
				<CardHeader>
					<CardTitle>Another Card</CardTitle>
					<CardDescription>With different content</CardDescription>
				</CardHeader>
				<CardContent>
					<p>Cards can contain any content you need.</p>
				</CardContent>
			</Card>
		</div>
	</section>

	<!-- Loading States -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Loading States</h2>
			<p class="text-sm text-muted-foreground mb-4">Spinners, skeletons, and progress indicators</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Loading Components</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="space-y-2">
					<h3 class="text-sm font-medium">Spinner</h3>
					<div class="flex gap-4">
						<Spinner />
						<Spinner size="sm" />
						<Spinner size="lg" />
					</div>
				</div>
				
				<Separator />
				
				<div class="space-y-2">
					<h3 class="text-sm font-medium">Progress</h3>
					<Progress value={progressValue} />
					<p class="text-sm text-muted-foreground">{progressValue}% complete</p>
				</div>
				
				<Separator />
				
				<div class="space-y-2">
					<h3 class="text-sm font-medium">Skeleton</h3>
					<div class="space-y-2">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-4 w-1/2" />
					</div>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Avatar -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Avatars</h2>
			<p class="text-sm text-muted-foreground mb-4">User profile images</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Avatar Examples</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex gap-4">
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarFallback>AB</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarFallback>XY</AvatarFallback>
					</Avatar>
				</div>
			</CardContent>
		</Card>
	</section>

	<!-- Table -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Table</h2>
			<p class="text-sm text-muted-foreground mb-4">Data tables</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Example Table</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Role</TableHead>
							<TableHead class="text-right">Amount</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell class="font-medium">John Doe</TableCell>
							<TableCell><Badge>Active</Badge></TableCell>
							<TableCell>Developer</TableCell>
							<TableCell class="text-right">$250.00</TableCell>
						</TableRow>
						<TableRow>
							<TableCell class="font-medium">Jane Smith</TableCell>
							<TableCell><Badge variant="secondary">Inactive</Badge></TableCell>
							<TableCell>Designer</TableCell>
							<TableCell class="text-right">$150.00</TableCell>
						</TableRow>
						<TableRow>
							<TableCell class="font-medium">Bob Johnson</TableCell>
							<TableCell><Badge>Active</Badge></TableCell>
							<TableCell>Manager</TableCell>
							<TableCell class="text-right">$350.00</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	</section>

	<!-- Tabs -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Tabs</h2>
			<p class="text-sm text-muted-foreground mb-4">Tabbed content navigation</p>
		</div>
		
		<Tabs value="account" class="w-full">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<Card>
					<CardHeader>
						<CardTitle>Account</CardTitle>
						<CardDescription>Manage your account settings</CardDescription>
					</CardHeader>
					<CardContent class="space-y-2">
						<div class="space-y-1">
							<Label for="name">Name</Label>
							<Input id="name" value="John Doe" />
						</div>
						<div class="space-y-1">
							<Label for="username">Username</Label>
							<Input id="username" value="@johndoe" />
						</div>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="password">
				<Card>
					<CardHeader>
						<CardTitle>Password</CardTitle>
						<CardDescription>Change your password</CardDescription>
					</CardHeader>
					<CardContent class="space-y-2">
						<div class="space-y-1">
							<Label for="current">Current password</Label>
							<Input id="current" type="password" />
						</div>
						<div class="space-y-1">
							<Label for="new">New password</Label>
							<Input id="new" type="password" />
						</div>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="settings">
				<Card>
					<CardHeader>
						<CardTitle>Settings</CardTitle>
						<CardDescription>Configure your preferences</CardDescription>
					</CardHeader>
					<CardContent>
						<p>Settings content goes here.</p>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	</section>

	<!-- Navigation -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Navigation</h2>
			<p class="text-sm text-muted-foreground mb-4">Breadcrumbs and pagination</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Breadcrumb</CardTitle>
			</CardHeader>
			<CardContent>
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href="/components">Components</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader>
				<CardTitle>Pagination</CardTitle>
			</CardHeader>
			<CardContent>
				<!-- <Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious href="#" />
						</PaginationItem>
						<PaginationItem>
							<PaginationLink href="#">1</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink href="#" isActive>2</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink href="#">3</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext href="#" />
						</PaginationItem>
					</PaginationContent>
				</Pagination> -->
			</CardContent>
		</Card>
	</section>

	<!-- Separator -->
	<section class="space-y-4">
		<div>
			<h2 class="text-2xl font-semibold mb-2">Separator</h2>
			<p class="text-sm text-muted-foreground mb-4">Visual dividers</p>
		</div>
		
		<Card>
			<CardHeader>
				<CardTitle>Horizontal Separator</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<p>Content above separator</p>
				<Separator />
				<p>Content below separator</p>
			</CardContent>
		</Card>
	</section>
</div>
