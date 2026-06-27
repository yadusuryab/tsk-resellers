import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
    const { id } = await context.params;
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Your existing query...
    const query = `*[_type == "product" && _id == $id][0]{
      _id,
      name,
      images[]{
        _type,
        _key,
        alt,
        asset->{_id, url},
        hotspot,
        videoFile{
          asset->{
            _id,
            url,
            mimeType,
            size
          }
        },
        videoUrl,
        poster{
          asset->{_id, url}
        },
        title
      },
      price,
      rating,
      salesPrice,
      sizes,
      colors,
      features,
      quantity,
      description,
      soldOut,
      category->{_id, title},
      featured,
      codAvailable
    }`;

    const product = await sanityClient.fetch(query, { id });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Process the images and media...
    const images: any = [];
    const media: any = [];

    if (product.images && product.images.length > 0) {
      product.images.forEach((item: any, index: number) => {
        const isVideo = item.videoFile || item.videoUrl;
        
        if (isVideo) {
          const videoItem = {
            _type: 'video',
            _key: item._key || `video-${index}`,
            title: item.title || '',
            alt: item.alt || '',
            videoFile: item.videoFile?.asset ? {
              asset: {
                url: item.videoFile.asset.url,
                mimeType: item.videoFile.asset.mimeType,
                size: item.videoFile.asset.size,
              }
            } : null,
            videoUrl: item.videoUrl || '',
            poster: item.poster?.asset ? {
              asset: {
                url: item.poster.asset.url,
              }
            } : null,
          };
          
          media.push(videoItem);
          
          if (item.poster?.asset?.url) {
            images.push({
              url: item.poster.asset.url,
              alt: item.alt || item.title || 'Video thumbnail',
              isVideo: true,
            });
          }
        } else {
          if (item.asset?.url) {
            const imageItem = {
              _type: 'image',
              _key: item._key || `img-${index}`,
              asset: {
                url: item.asset.url,
              },
              alt: item.alt || '',
              hotspot: item.hotspot || null,
            };
            
            media.push(imageItem);
            images.push({
              url: item.asset.url,
              alt: item.alt || '',
            });
          }
        }
      });
    }

    const codAvailable = product.codAvailable !== undefined ? product.codAvailable : true;
    
    return NextResponse.json({ 
      ...product, 
      codAvailable,
      images,
      media,
      hasVideos: media.some((item: any) => item._type === 'video')
    });
    
  } catch (error) {
    console.error("Sanity fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}