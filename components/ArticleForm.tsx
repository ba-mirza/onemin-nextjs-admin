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
import {Select, SelectContent, SelectItem, SelectValue} from "./ui/select";
import {SelectTrigger} from "@/components/ui/select";
import {categories} from "@/constants";
import {SimpleEditor} from "@/components/tiptap-templates/simple/simple-editor";

const formSchema = z.object({
    previewImage: z
        .any()
        .refine((file) => {
            if (!file || !(file instanceof File)) return false;
            return file.size <= 5 * 1024 * 1024; // 5MB limit
        }, "Нужно выбрать файл не более 5MB"),
    title: z.string().min(3, {message: 'Название не должно быть меньше 3 символов'}),
    excerpt: z.string().optional(),
    category: z.string().min(1, "Выберите категорию"),
    tags: z.array(z.string()).optional(),
    content: z.any().refine((content) => {
        if (!content) return false;
        // Проверяем что контент не пустой (базовая проверка)
        if (content.content && Array.isArray(content.content)) {
            return content.content.some((node: any) =>
                node.content && node.content.length > 0
            );
        }
        return false;
    }, "Контент статьи не может быть пустым"),
})

const ArticleForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            excerpt: '',
            category: '',
            content: {},
        }
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="previewImage"
                    render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>Картинка для статьи</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        onChange(file);
                                    }}
                                    {...field}
                                />
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
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Содержание статьи</FormLabel>
                            <FormControl>
                                <div className="border rounded-md">
                                    <SimpleEditor
                                        onChange={field.onChange}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2">
                    <button className="btn-primary" type="submit" name="action" value="publish">Опубликовать</button>
                    <button className="btn-primary" type="submit" name="action" value="draft">Сохранить</button>
                </div>
            </form>
        </Form>
    )
}

export default ArticleForm