import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, children, className, ...props }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-6", className)} {...props}>
            <div className="grid gap-1">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    )
}
