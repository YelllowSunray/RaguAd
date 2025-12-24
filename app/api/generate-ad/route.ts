import { NextRequest, NextResponse } from "next/server";
import { createCanvas, loadImage } from "canvas";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const texts = formData.getAll("texts") as string[];

    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (images.length !== texts.length) {
      return NextResponse.json(
        { error: "Number of images and texts must match" },
        { status: 400 }
      );
    }

    // Using user's input text directly - no Gemini needed

    // Generate ads for each image-text pair
    const adPromises = images.map(async (image, index) => {
      const discountText = texts[index]?.trim() || "";
      
      if (!discountText) {
        return {
          index: index + 1,
          adText: `--- Ad ${index + 1} ---\nNo discount text provided.\n`,
          imageBase64: null
        };
      }

      // Convert image to base64
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const imagePart = {
        inlineData: {
          data: base64,
          mimeType: image.type,
        },
      };

      try {
        // Use the user's discount text directly - no Gemini text generation needed
        const adText = discountText;

        // Now overlay the beautiful ad text on the product image
        const imageBuffer = Buffer.from(bytes);
        const img = await loadImage(imageBuffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");
        
        // Draw original image with subtle overlay for better text readability
        ctx.drawImage(img, 0, 0);
        
        // Add subtle dark overlay on entire image for better contrast
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Parse ad text into lines
        const lines = adText.split("\n").filter(line => line.trim()).slice(0, 3);
        
        // Calculate beautiful centered text box with better proportions
        const padding = 50;
        const maxWidth = canvas.width - (padding * 2);
        const centerX = canvas.width / 2;
        
        // Beautiful, refined font sizes - proportional to image
        const winsWereldSize = Math.min(Math.max(canvas.width / 7, 44), 64);
        const headlineSize = Math.min(Math.max(canvas.width / 11, 42), 72);
        const priceSize = Math.min(Math.max(canvas.width / 13, 38), 62);
        const ctaSize = Math.min(Math.max(canvas.width / 15, 34), 52);
        
        // Text wrapping function
        const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
          ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;
          const words = text.split(" ");
          const wrappedLines: string[] = [];
          let currentLine = "";
          
          words.forEach((word) => {
            const testLine = currentLine + (currentLine ? " " : "") + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== "") {
              wrappedLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine) wrappedLines.push(currentLine);
          return wrappedLines;
        };
        
        // Calculate total height needed with better spacing (accounting for arch)
        const archHeight = 50; // Height of Taj Mahal arch (like the iwan entrance)
        let totalHeight = winsWereldSize + 35; // Space for "Wins Wereld" with elegant spacing
        if (lines[0]) totalHeight += wrapText(lines[0], maxWidth, headlineSize).length * (headlineSize + 22) + 8;
        if (lines[1]) totalHeight += wrapText(lines[1], maxWidth, priceSize).length * (priceSize + 20) + 20;
        if (lines[2]) totalHeight += wrapText(lines[2], maxWidth, ctaSize).length * (ctaSize + 18) + 15;
        
        const textBoxHeight = totalHeight + 140 + archHeight; // Include arch height
        const textBoxWidth = Math.min(canvas.width - 60, maxWidth + 140);
        const centerY = canvas.height / 2;
        const textBoxY = centerY - (textBoxHeight / 2);
        
        // Draw BEAUTIFUL premium gradient background with Indian elegance
        // Sophisticated color palette: Rich Saffron, Luxurious Gold, Deep Burgundy
        const gradient = ctx.createLinearGradient(
          centerX - textBoxWidth / 2,
          textBoxY - 70,
          centerX + textBoxWidth / 2,
          textBoxY + textBoxHeight
        );
        gradient.addColorStop(0, "rgba(255, 165, 0, 0.94)"); // Rich Saffron
        gradient.addColorStop(0.2, "rgba(255, 193, 7, 0.94)"); // Luxurious Gold
        gradient.addColorStop(0.4, "rgba(255, 140, 0, 0.94)"); // Warm Orange
        gradient.addColorStop(0.6, "rgba(220, 53, 69, 0.94)"); // Elegant Red
        gradient.addColorStop(0.8, "rgba(184, 28, 28, 0.94)"); // Deep Burgundy
        gradient.addColorStop(1, "rgba(139, 0, 0, 0.94)"); // Rich Dark Red
        
        // Draw Taj Mahal-inspired design with arched top
        const cornerRadius = 25;
        const archWidth = textBoxWidth * 0.6; // Width of the arch
        const topY = textBoxY - 70;
        
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 35;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 12;
        
        // Create Taj Mahal-inspired shape with arched top
        ctx.beginPath();
        
        // Start from bottom left
        ctx.moveTo(centerX - textBoxWidth / 2 + cornerRadius, topY + textBoxHeight);
        
        // Bottom left corner
        ctx.quadraticCurveTo(
          centerX - textBoxWidth / 2,
          topY + textBoxHeight,
          centerX - textBoxWidth / 2,
          topY + textBoxHeight - cornerRadius
        );
        
        // Left side
        ctx.lineTo(centerX - textBoxWidth / 2, topY + archHeight + cornerRadius);
        
        // Left side top corner
        ctx.quadraticCurveTo(
          centerX - textBoxWidth / 2,
          topY + archHeight,
          centerX - textBoxWidth / 2 + cornerRadius,
          topY + archHeight
        );
        
        // Left side of arch (curving up to arch)
        ctx.lineTo(centerX - archWidth / 2, topY + archHeight);
        
        // Central arch (Taj Mahal-inspired pointed arch)
        // Create a beautiful pointed arch using bezier curves
        const archTopY = topY + 15;
        const archControlY = topY - 5; // Control point for arch curve
        
        ctx.bezierCurveTo(
          centerX - archWidth / 4, topY + archHeight * 0.7, // Left control point
          centerX - archWidth / 6, archControlY, // Top left control
          centerX, archTopY // Arch peak (center top)
        );
        
        ctx.bezierCurveTo(
          centerX + archWidth / 6, archControlY, // Top right control
          centerX + archWidth / 4, topY + archHeight * 0.7, // Right control point
          centerX + archWidth / 2, topY + archHeight // Right side of arch
        );
        
        // Right side of arch
        ctx.lineTo(centerX + textBoxWidth / 2 - cornerRadius, topY + archHeight);
        
        // Right side top corner
        ctx.quadraticCurveTo(
          centerX + textBoxWidth / 2,
          topY + archHeight,
          centerX + textBoxWidth / 2,
          topY + archHeight + cornerRadius
        );
        
        // Right side
        ctx.lineTo(centerX + textBoxWidth / 2, topY + textBoxHeight - cornerRadius);
        
        // Bottom right corner
        ctx.quadraticCurveTo(
          centerX + textBoxWidth / 2,
          topY + textBoxHeight,
          centerX + textBoxWidth / 2 - cornerRadius,
          topY + textBoxHeight
        );
        
        // Bottom
        ctx.lineTo(centerX - textBoxWidth / 2 + cornerRadius, topY + textBoxHeight);
        
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Taj Mahal-inspired decorative borders
        // Outer elegant white border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Decorative inner arch border (following the arch shape)
        ctx.save();
        ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.bezierCurveTo(
          centerX - archWidth / 4, topY + archHeight * 0.7 + 8,
          centerX - archWidth / 6, archControlY + 8,
          centerX, archTopY + 8
        );
        ctx.bezierCurveTo(
          centerX + archWidth / 6, archControlY + 8,
          centerX + archWidth / 4, topY + archHeight * 0.7 + 8,
          centerX + archWidth / 2, topY + archHeight + 8
        );
        ctx.stroke();
        ctx.restore();
        
        // Inner subtle decorative border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          centerX - textBoxWidth / 2 + 10,
          topY + archHeight + 10,
          textBoxWidth - 20,
          textBoxHeight - archHeight - 20
        );
        
        // Draw text - BEAUTIFUL, PREMIUM, and ELEGANT
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let currentY = textBoxY;
        
        // "Wins Wereld" at the top - PREMIUM and BEAUTIFUL
        ctx.font = `bold ${winsWereldSize}px 'Arial', sans-serif`;
        ctx.save();
        // Premium shadow with depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        // Pure white for maximum elegance
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Wins Wereld", centerX, currentY);
        ctx.restore();
        currentY += winsWereldSize + 32; // Elegant spacing
        
        // User's discount text below "Wins Wereld" - BEAUTIFUL premium styling
        // Headline - PREMIUM, ELEGANT with perfect spacing
        if (lines[0]) {
          ctx.font = `bold ${headlineSize}px 'Arial', sans-serif`;
          const headlineLines = wrapText(lines[0], maxWidth, headlineSize);
          headlineLines.forEach((line) => {
            ctx.save();
            // Beautiful shadow for depth
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(line, centerX, currentY);
            ctx.restore();
            currentY += headlineSize + 22; // Perfect elegant spacing
          });
          currentY += 18;
        }
        
        // Price/Discount - BEAUTIFUL GOLD with premium feel
        if (lines[1]) {
          ctx.font = `bold ${priceSize}px 'Arial', sans-serif`;
          const priceLines = wrapText(lines[1], maxWidth, priceSize);
          priceLines.forEach((line) => {
            ctx.save();
            // Premium shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 7;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            // Beautiful rich gold color
            ctx.fillStyle = "#FFD700"; // Premium gold
            ctx.fillText(line, centerX, currentY);
            ctx.restore();
            currentY += priceSize + 20; // Elegant spacing
          });
          currentY += 15;
        }
        
        // Call to Action - BEAUTIFUL and PREMIUM
        if (lines[2]) {
          ctx.font = `bold ${ctaSize}px 'Arial', sans-serif`;
          const ctaLines = wrapText(lines[2], maxWidth, ctaSize);
          ctaLines.forEach((line) => {
            ctx.save();
            // Elegant shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(line, centerX, currentY);
            ctx.restore();
            currentY += ctaSize + 18; // Perfect spacing
          });
        }
        
        // Convert to base64
        const finalImageBase64 = canvas.toDataURL("image/png").split(",")[1];
        
        return {
          index: index + 1,
          adText: `--- Ad ${index + 1} ---\n${adText}\n`,
          imageBase64: finalImageBase64
        };
        
      } catch (error) {
        console.error(`Error generating ad for image ${index + 1}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          index: index + 1,
          adText: `--- Ad ${index + 1} ---\nError generating ad: ${errorMessage}\n`,
          imageBase64: null,
          error: errorMessage
        };
      }
    });

    const results = await Promise.all(adPromises);
    const combinedAdText = results.map(r => r.adText).join("\n\n");
    const generatedImages = results.map(r => ({
      index: r.index,
      imageBase64: r.imageBase64
    }));

    return NextResponse.json({ 
      adText: combinedAdText,
      images: generatedImages
    });
  } catch (error) {
    console.error("Error generating ad:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: "Failed to generate ad",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
