'use client'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectValue} from "./ui/select";
import {SelectTrigger} from "@/components/ui/select";
import {categories} from "@/constants";

const formSchema = z.object({
    previewImage: z
        .any()
        .refine((f) => f instanceof File, "Нужно выбрать файл"),
    title: z.string().min(3, {message: 'Название не должно быть меньше 3 символов'}),
    excerpt: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    content: z.json(),
})

const ArticleForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
        }
    })

    const onSubmit = () => {
        console.log("submit")
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="previewImage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Картинка для статьи</FormLabel>
                            <FormControl>
                                <Input type="file" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Заголовок статьи</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Краткая выдержка</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Категория</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="input capitalize">
                                        <SelectValue placeholder="Выберите категорию" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category: string) => (
                                            <SelectItem className="capitalize" key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" name="action" value="publish">Опубликовать</Button>
                <Button type="submit" name="action" value="draft">Сохранить</Button>
            </form>
        </Form>
    )
}

export default ArticleForm