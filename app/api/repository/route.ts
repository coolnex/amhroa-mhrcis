// app/api/repository/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const category = searchParams.get("category");
    const year = searchParams.get("year");
    const author = searchParams.get("author");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("repository_resources")
      .select("*", { count: "exact" });

    // Apply filters
    if (country && country !== "all") {
      query = query.eq("country", country);
    }
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (year && year !== "all") {
      query = query.eq("publication_year", parseInt(year));
    }
    if (author) {
      query = query.ilike("author", `%${author}%`);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch resources",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Get filter options for UI
    const { data: categories } = await supabase
      .from("repository_resources")
      .select("category")
      .not("category", "is", null);

    const { data: countries } = await supabase
      .from("repository_resources")
      .select("country")
      .not("country", "is", null);

    const { data: years } = await supabase
      .from("repository_resources")
      .select("publication_year")
      .not("publication_year", "is", null);

    const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))];
    const uniqueCountries = [...new Set(countries?.map(c => c.country).filter(Boolean))];
    const uniqueYears = [...new Set(years?.map(y => y.publication_year).filter(Boolean))].sort((a, b) => b - a);

    return NextResponse.json({
      success: true,
      resources: data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
      filters: {
        categories: uniqueCategories,
        countries: uniqueCountries,
        years: uniqueYears,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch resources",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      author,
      category,
      country,
      publication_year,
      file_url,
      thumbnail_url,
      resource_type,
      tags,
      created_by,
    } = body;

    // Validate required fields
    if (!title || !author || !category || !resource_type || !created_by) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields: title, author, category, resource_type, created_by" 
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("repository_resources")
      .insert({
        title: title,
        description: description || null,
        author: author,
        category: category,
        country: country || null,
        publication_year: publication_year || null,
        file_url: file_url || null,
        thumbnail_url: thumbnail_url || null,
        resource_type: resource_type,
        tags: tags || [],
        created_by: created_by,
        downloads: 0,
        views: 0,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to add resource",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource added successfully",
      resource: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add resource",
      },
      { status: 500 }
    );
  }
}