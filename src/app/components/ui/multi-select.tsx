"use client";

import * as React from "react";
import { Check, X, ChevronsUpDown } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover";
import { Badge } from "./badge";

interface MultiSelectProps {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select options...",
    searchPlaceholder = "Search...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        onChange(value.filter((i) => i !== item));
    };

    const handleSelect = (item: string) => {
        if (value.includes(item)) {
            onChange(value.filter((i) => i !== item));
        } else {
            onChange([...value, item]);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div
                        role="combobox"
                        aria-expanded={open}
                        tabIndex={0}
                        className={cn(
                            "flex min-h-10 w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 disabled:cursor-not-allowed disabled:opacity-50",
                            className
                        )}
                        onClick={() => setOpen(!open)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setOpen(!open);
                            }
                        }}
                    >
                        <div className="flex flex-wrap gap-1">
                            {value.length > 0 ? (
                                value.map((item) => (
                                    <Badge
                                        key={item}
                                        variant="secondary"
                                        className="bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200"
                                    >
                                        {item}
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleUnselect(item);
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleUnselect(item);
                                            }}
                                        >
                                            <X className="h-3 w-3 text-stone-500 hover:text-stone-900" />
                                        </span>
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-stone-500">{placeholder}</span>
                            )}
                        </div>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option}
                                        onSelect={() => handleSelect(option)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.includes(option) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
