const Content = require("../model/contentModel");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// Get all content
const getAllContent = asyncHandler(async (req, res) => {
  const { page, section } = req.query;

  const filter = {};
  if (page) filter.page = page;
  if (section) filter.section = section;

  const contents = await Content.find(filter).sort({ page: 1, order: 1, createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, contents, "Content fetched successfully"));
});

// Get content by key
const getContentByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const content = await Content.findOne({ key, isActive: true });

  if (!content) {
    throw new ApiError(404, "Content not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, content, "Content fetched successfully"));
});

// Get content by page
const getContentByPage = asyncHandler(async (req, res) => {
  const { page } = req.params;

  const contents = await Content.find({ page, isActive: true }).sort({
    order: 1,
    createdAt: 1,
  });

  // Convert to object with keys for easier frontend access
  const contentObject = {};
  contents.forEach((item) => {
    contentObject[item.key] = {
      title: item.title,
      content: item.content,
      type: item.type,
      section: item.section,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, contentObject, "Page content fetched successfully")
    );
});

// Create or update content
const upsertContent = asyncHandler(async (req, res) => {
  const { key, page, section, title, content, type, order, isActive } = req.body;

  if (!key || !page || !section || !content) {
    throw new ApiError(400, "Key, page, section, and content are required");
  }

  const contentData = {
    key: key.toLowerCase().trim(),
    page,
    section,
    content,
    type: type || "text",
    order: order || 0,
    isActive: isActive !== undefined ? isActive : true,
  };

  if (title) contentData.title = title;

  const updatedContent = await Content.findOneAndUpdate(
    { key: contentData.key },
    contentData,
    { new: true, upsert: true, runValidators: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedContent, "Content saved successfully")
    );
});

// Update multiple contents
const updateMultipleContents = asyncHandler(async (req, res) => {
  const { contents } = req.body;

  if (!Array.isArray(contents)) {
    throw new ApiError(400, "Contents must be an array");
  }

  const results = [];

  for (const item of contents) {
    const { key, page, section, title, content, type, order, isActive } = item;

    if (!key || !page || !section || !content) {
      results.push({
        key: key || "unknown",
        success: false,
        error: "Key, page, section, and content are required",
      });
      continue;
    }

    try {
      const contentData = {
        key: key.toLowerCase().trim(),
        page,
        section,
        content,
        type: type || "text",
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      };

      if (title) contentData.title = title;

      const updatedContent = await Content.findOneAndUpdate(
        { key: contentData.key },
        contentData,
        { new: true, upsert: true, runValidators: true }
      );

      results.push({
        key: contentData.key,
        success: true,
        data: updatedContent,
      });
    } catch (error) {
      results.push({
        key: key.toLowerCase().trim(),
        success: false,
        error: error.message,
      });
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, results, "Contents updated successfully")
    );
});

// Delete content
const deleteContent = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const content = await Content.findOneAndDelete({ key });

  if (!content) {
    throw new ApiError(404, "Content not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Content deleted successfully"));
});

// Initialize default content
const initializeDefaultContent = asyncHandler(async (req, res) => {
  console.log("initializeDefaultContent called");
  
  try {
    // Verify Content model is available
    if (!Content) {
      console.error("Content model is not available");
      throw new ApiError(500, "Content model is not available");
    }
    
    console.log("Content model is available, starting initialization...");
    
    // Validate defaultContents array structure
    const defaultContents = [
    // Home Page
    {
      key: "home_about_community",
      page: "home",
      section: "about",
      title: "About Our Community",
      content:
        "R.E.S.T is a vibrant community dedicated to supporting retired telecommunications professionals. We provide a platform for continued connection, shared experiences, and mutual support among our members. Our organization has been serving the telecommunications community for years, fostering relationships and creating opportunities for meaningful engagement in retirement.",
      type: "text",
      order: 1,
    },
    {
      key: "home_vision",
      page: "home",
      section: "vision_mission_values",
      title: "Vision",
      content:
        "To create a supportive platform where retired telecommunications professionals can thrive, share their expertise, and contribute to national development and social welfare.",
      type: "text",
      order: 1,
    },
    {
      key: "home_mission",
      page: "home",
      section: "vision_mission_values",
      title: "Mission",
      content:
        "To safeguard the welfare of retired employees through income-generating programs, skill enhancement, advocacy for rights, and facilitation of their involvement in telecom-related initiatives and disaster response.",
      type: "text",
      order: 2,
    },
    {
      key: "home_values",
      page: "home",
      section: "vision_mission_values",
      title: "Value",
      content:
        "We value respect, integrity, community support, and the wisdom of experience. Our commitment includes honoring contributions, promoting entitlements, and collaborating with similar organizations for consumer rights and sector coordination.",
      type: "text",
      order: 3,
    },
    // About Page
    {
      key: "about_hero_subtitle",
      page: "about",
      section: "hero",
      content:
        "Safeguarding the welfare of retired telecom professionals and harnessing their expertise for national development.",
      type: "text",
      order: 1,
    },
    {
      key: "about_welcome_para1",
      page: "about",
      section: "welcome",
      content:
        "The Nepal Telecommunication Retired Employees Society (REST) was established to safeguard and promote the welfare of former employees retired from Nepal Telecommunications Corporation and Nepal Telecom, who receive retirement benefits or pensions.",
      type: "text",
      order: 1,
    },
    {
      key: "about_welcome_para2",
      page: "about",
      section: "welcome",
      content:
        "We honor these individuals for their service and encourage their continued contribution to the telecommunications sector and social development. Through income-generating and skill-enhancement programs, we harness the knowledge, expertise, and insights of retirees for national development.",
      type: "text",
      order: 2,
    },
    {
      key: "about_welcome_para3",
      page: "about",
      section: "welcome",
      content:
        "REST serves as a platform to recognize the value of our members and ensure their meaningful engagement post-retirement. Retirement is not an end but a new beginning for growth, contribution, and community support.",
      type: "text",
      order: 3,
    },
    {
      key: "about_nonprofit_desc",
      page: "about",
      section: "features",
      title: "Non-Profit Social Organization",
      content:
        "A public interest organization dedicated to the welfare of over 500+ retired telecom professionals across Nepal.",
      type: "text",
      order: 1,
    },
    {
      key: "about_rights_welfare_desc",
      page: "about",
      section: "features",
      title: "Rights and Welfare Protection",
      content:
        "Advocating for the rights, interests, and entitlements of former employees, with headquarters in Kathmandu and nationwide outreach.",
      type: "text",
      order: 2,
    },
    {
      key: "about_skill_enhancement_desc",
      page: "about",
      section: "features",
      title: "Skill Enhancement and Engagement",
      content:
        "Programs for training, research, and utilizing retired expertise in telecommunications, including collaborations for national development.",
      type: "text",
      order: 3,
    },
    {
      key: "about_vision",
      page: "about",
      section: "vision_mission_values",
      title: "Vision",
      content:
        "To create a supportive platform where retired telecommunications professionals can thrive, share their expertise, and contribute to national development and social welfare.",
      type: "text",
      order: 1,
    },
    {
      key: "about_mission",
      page: "about",
      section: "vision_mission_values",
      title: "Mission",
      content:
        "To safeguard the welfare of retired employees through income-generating programs, skill enhancement, advocacy for rights, and facilitation of their involvement in telecom-related initiatives and disaster response.",
      type: "text",
      order: 2,
    },
    {
      key: "about_values",
      page: "about",
      section: "vision_mission_values",
      title: "Values",
      content:
        "We value respect, integrity, community support, and the wisdom of experience. Our commitment includes honoring contributions, promoting entitlements, and collaborating with similar organizations for consumer rights and sector coordination.",
      type: "text",
      order: 3,
    },
    {
      key: "about_chairman_greeting",
      page: "about",
      section: "chairman_message",
      content: "Respected members, greetings and salutations!",
      type: "text",
      order: 1,
    },
    {
      key: "about_chairman_para1",
      page: "about",
      section: "chairman_message",
      content:
        "It brings me immense joy to welcome you to our Nepal Telecommunication Retired Employees Society (REST) website. Retirement is not an end but a new beginning for continued contribution to the telecommunications sector and national development.",
      type: "text",
      order: 2,
    },
    {
      key: "about_chairman_para2",
      page: "about",
      section: "chairman_message",
      content:
        "Our Society honors the service of retired employees from Nepal Telecom, safeguarding their welfare through programs that harness their knowledge and expertise. We protect rights, promote entitlements, and facilitate engagement in training, research, and disaster response.",
      type: "text",
      order: 3,
    },
    {
      key: "about_chairman_para3",
      page: "about",
      section: "chairman_message",
      content:
        "Through REST, we advocate for representation in Nepal Telecom initiatives and collaborate with similar organizations to enhance consumer rights and social services.",
      type: "text",
      order: 4,
    },
    {
      key: "about_chairman_para4",
      page: "about",
      section: "chairman_message",
      content:
        "I encourage you to participate in our events, share your experiences, and help build a stronger community that ensures meaningful post-retirement involvement.",
      type: "text",
      order: 5,
    },
    {
      key: "about_chairman_closing",
      page: "about",
      section: "chairman_message",
      content: "Thank you for being part of this wonderful journey.",
      type: "text",
      order: 6,
    },
    // Events Page
    {
      key: "events_hero_subtitle",
      page: "events",
      section: "hero",
      content:
        "Stay connected with our community through regular events and activities",
      type: "text",
      order: 1,
    },
    // Gallery Page
    {
      key: "gallery_hero_subtitle",
      page: "gallery",
      section: "hero",
      content:
        "Capturing moments of our vibrant community life and activities",
      type: "text",
      order: 1,
    },
    // Contact Page
    {
      key: "contact_hero_subtitle",
      page: "contact",
      section: "hero",
      content: "We're here to help and answer any questions you may have",
      type: "text",
      order: 1,
    },
    {
      key: "contact_phone",
      page: "contact",
      section: "contact_info",
      title: "Phone",
      content: "+977-1-4271711",
      type: "text",
      order: 1,
    },
    {
      key: "contact_email_primary",
      page: "contact",
      section: "contact_info",
      title: "Email Primary",
      content: "info@rest.org.np",
      type: "text",
      order: 2,
    },
    {
      key: "contact_email_secondary",
      page: "contact",
      section: "contact_info",
      title: "Email Secondary",
      content: "support@rest.org.np",
      type: "text",
      order: 3,
    },
    {
      key: "contact_address_line1",
      page: "contact",
      section: "contact_info",
      title: "Address Line 1",
      content: "Deoneshwar Bhawan",
      type: "text",
      order: 4,
    },
    {
      key: "contact_address_line2",
      page: "contact",
      section: "contact_info",
      title: "Address Line 2",
      content: "Bhadrakali Plaza, Kathmandu",
      type: "text",
      order: 5,
    },
    {
      key: "contact_address_line3",
      page: "contact",
      section: "contact_info",
      title: "Address Line 3",
      content: "Nepal",
      type: "text",
      order: 6,
    },
    {
      key: "contact_office_hours",
      page: "contact",
      section: "contact_info",
      title: "Office Hours",
      content: "sun – Fri: 9:00 AM – 5:00 PM",
      type: "text",
      order: 7,
    },
    {
      key: "contact_office_hours_saturday",
      page: "contact",
      section: "contact_info",
      title: "Office Hours Saturday",
      content: "Saturday: Closed",
      type: "text",
      order: 8,
    },
    {
      key: "contact_emergency_phone",
      page: "contact",
      section: "contact_info",
      title: "Emergency Phone",
      content: "+977-1-4271711",
      type: "text",
      order: 9,
    },
    // Login Page
    {
      key: "login_hero_subtitle",
      page: "login",
      section: "hero",
      content:
        "Access your account to connect with the retired telecommunications community.",
      type: "text",
      order: 1,
    },
    // Footer
    {
      key: "footer_copyright",
      page: "footer",
      section: "copyright",
      content: "© 2024 R.E.S.T. All Rights Reserved.",
      type: "text",
      order: 1,
    },
    {
      key: "footer_address",
      page: "footer",
      section: "contact",
      content: "Babarmahal, Kathmandu, Nepal",
      type: "text",
      order: 1,
    },
    {
      key: "footer_phone",
      page: "footer",
      section: "contact",
      content: "+977-1-4794225",
      type: "text",
      order: 2,
    },
    {
      key: "footer_email",
      page: "footer",
      section: "contact",
      content: "rest@ntc.net.np",
      type: "text",
      order: 3,
    },
  ];

  // Validate all items before processing
  console.log(`Validating ${defaultContents.length} default content items...`);
  for (let i = 0; i < defaultContents.length; i++) {
    const item = defaultContents[i];
    if (!item.key || !item.page || !item.section || !item.content) {
      const errorMsg = `Invalid item at index ${i}: missing required fields. Item: ${JSON.stringify(item)}`;
      console.error(errorMsg);
      throw new ApiError(400, errorMsg);
    }
  }
  console.log("All items validated successfully");

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  console.log(`Processing ${defaultContents.length} default content items...`);

  for (let i = 0; i < defaultContents.length; i++) {
    const item = defaultContents[i];
    try {
      // Ensure key is lowercase for search (schema has lowercase: true)
      const searchKey = item.key.toLowerCase().trim();
      
      console.log(`Processing item ${i + 1}/${defaultContents.length}: ${searchKey}`);
      
      // Check if content already exists
      const existing = await Content.findOne({ key: searchKey });
      if (!existing) {
        // Ensure key is lowercase before creating (mongoose will also convert it)
        const contentData = {
          ...item,
          key: searchKey,
        };
        
        // Validate required fields
        if (!contentData.page || !contentData.section || !contentData.content) {
          const errorMsg = `Missing required fields for key: ${searchKey}. page: ${contentData.page}, section: ${contentData.section}, content: ${!!contentData.content}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        console.log(`Creating content for key: ${searchKey}`);
        const content = await Content.create(contentData);
        console.log(`Successfully created content for key: ${searchKey}`);
        results.push({ key: searchKey, action: "created", success: true });
        successCount++;
      } else {
        console.log(`Content already exists for key: ${searchKey}, skipping`);
        results.push({ key: searchKey, action: "skipped", success: true });
        successCount++;
      }
    } catch (error) {
      console.error(`Error processing content for key ${item.key}:`, error);
      console.error(`Error details:`, {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      errorCount++;
      results.push({
        key: item.key,
        action: "error",
        success: false,
        error: error.message || String(error),
      });
    }
  }

  console.log(`Initialization complete: ${successCount} succeeded, ${errorCount} failed`);
  
  return res
    .status(200)
    .json(
      new ApiResponse(200, results, "Default content initialized successfully")
    );
  } catch (error) {
    console.error("Error in initializeDefaultContent:", error);
    console.error("Error stack:", error.stack);
    // Re-throw to let asyncHandler handle it
    throw error;
  }
});

module.exports = {
  getAllContent,
  getContentByKey,
  getContentByPage,
  upsertContent,
  updateMultipleContents,
  deleteContent,
  initializeDefaultContent,
};

