"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

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

interface ComboboxProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    allowCustom?: boolean;
    className?: string;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    allowCustom = false,
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    const filteredOptions = React.useMemo(() => {
        return options.filter((option) =>
            option.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [options, searchValue]);

    const showCustomAdd = allowCustom && searchValue && !options.some(o => o.toLowerCase() === searchValue.toLowerCase());

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", className)}
                >
                    {value ? value : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {showCustomAdd ? (
                                <div className="p-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-sm"
                                        onClick={() => {
                                            onChange(searchValue);
                                            setOpen(false);
                                            setSearchValue("");
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add "{searchValue}"
                                    </Button>
                                </div>
                            ) : (
                                emptyText
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue);
                                        setOpen(false);
                                        setSearchValue("");
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option ? "opacity-100" : "opacity-0"
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
    );
}
