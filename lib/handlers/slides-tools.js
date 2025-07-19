/**
 * Google Slides Operations Handler
 * Claude-AppsScript-Pro Slides Tools Module
 * 
 * Provides Google Slides API operations with OAuth authentication
 * Handles presentations reading, analysis, and basic operations
 */

/**
 * Google Slides Tools Handler
 * Provides comprehensive Google Slides operations
 */
class SlidesTools {
  constructor(apiManager) {
    this.apiManager = apiManager;
  }

  /**
   * Read Google Slides presentation content
   * @param {string} presentationId - Google Slides presentation ID
   * @param {boolean} includeText - Include text content from slides
   * @param {boolean} includeImages - Include basic image information
   * @returns {Object} Slides presentation data
   */
  async readPresentation(presentationId, includeText = true, includeImages = false) {
    try {
      const slidesApi = this.apiManager.getSlidesApi();
      
      // Get presentation basic information
      const presentation = await slidesApi.presentations.get({
        presentationId: presentationId
      });

      const result = {
        presentationId: presentation.data.presentationId,
        title: presentation.data.title,
        locale: presentation.data.locale,
        pageSize: presentation.data.pageSize,
        slideCount: presentation.data.slides ? presentation.data.slides.length : 0,
        slides: []
      };

      if (presentation.data.slides) {
        for (let i = 0; i < presentation.data.slides.length; i++) {
          const slide = presentation.data.slides[i];
          const slideInfo = {
            slideId: slide.objectId,
            slideIndex: i + 1,
            layoutId: slide.slideProperties?.layoutObjectId,
            masterObjectId: slide.slideProperties?.masterObjectId
          };

          // Extract text content if requested
          if (includeText && slide.pageElements) {
            slideInfo.textContent = [];
            for (const element of slide.pageElements) {
              if (element.shape && element.shape.text) {
                const textRuns = element.shape.text.textElements || [];
                let slideText = '';
                for (const textElement of textRuns) {
                  if (textElement.textRun) {
                    slideText += textElement.textRun.content;
                  }
                }
                if (slideText.trim()) {
                  slideInfo.textContent.push({
                    elementId: element.objectId,
                    text: slideText.trim()
                  });
                }
              }
            }
          }

          // Extract basic image information if requested
          if (includeImages && slide.pageElements) {
            slideInfo.images = [];
            for (const element of slide.pageElements) {
              if (element.image) {
                slideInfo.images.push({
                  elementId: element.objectId,
                  contentUrl: element.image.contentUrl,
                  sourceUrl: element.image.sourceUrl,
                  description: element.description || 'No description'
                });
              }
            }
          }

          result.slides.push(slideInfo);
        }
      }

      return {
        success: true,
        data: result,
        message: `Successfully read presentation: ${result.title} (${result.slideCount} slides)`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.status,
        message: `Failed to read presentation: ${presentationId}`
      };
    }
  }

  /**
   * Get presentation basic information
   * @param {string} presentationId - Google Slides presentation ID
   * @returns {Object} Basic presentation information
   */
  async getPresentationInfo(presentationId) {
    try {
      const slidesApi = this.apiManager.getSlidesApi();
      
      const presentation = await slidesApi.presentations.get({
        presentationId: presentationId,
        fields: 'presentationId,title,locale,pageSize,slides(objectId,slideProperties)'
      });

      const result = {
        presentationId: presentation.data.presentationId,
        title: presentation.data.title,
        locale: presentation.data.locale,
        pageSize: presentation.data.pageSize,
        slideCount: presentation.data.slides ? presentation.data.slides.length : 0,
        slideIds: presentation.data.slides ? 
          presentation.data.slides.map(slide => slide.objectId) : []
      };

      return {
        success: true,
        data: result,
        message: `Successfully retrieved presentation info for: ${result.title}`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.status,
        message: `Failed to get presentation info: ${presentationId}`
      };
    }
  }

  /**
   * Extract all text content from presentation
   * @param {string} presentationId - Google Slides presentation ID
   * @param {number} maxSlides - Maximum number of slides to process (default: 50)
   * @returns {Object} Text content from all slides
   */
  async extractTextContent(presentationId, maxSlides = 50) {
    try {
      const slidesApi = this.apiManager.getSlidesApi();
      
      const presentation = await slidesApi.presentations.get({
        presentationId: presentationId
      });

      const result = {
        presentationId: presentation.data.presentationId,
        title: presentation.data.title,
        totalSlides: presentation.data.slides ? presentation.data.slides.length : 0,
        processedSlides: 0,
        textContent: []
      };

      if (presentation.data.slides) {
        const slidesToProcess = Math.min(presentation.data.slides.length, maxSlides);
        
        for (let i = 0; i < slidesToProcess; i++) {
          const slide = presentation.data.slides[i];
          const slideText = {
            slideIndex: i + 1,
            slideId: slide.objectId,
            textElements: []
          };

          if (slide.pageElements) {
            for (const element of slide.pageElements) {
              if (element.shape && element.shape.text) {
                const textRuns = element.shape.text.textElements || [];
                let elementText = '';
                for (const textElement of textRuns) {
                  if (textElement.textRun) {
                    elementText += textElement.textRun.content;
                  }
                }
                if (elementText.trim()) {
                  slideText.textElements.push({
                    elementId: element.objectId,
                    text: elementText.trim()
                  });
                }
              }
            }
          }

          if (slideText.textElements.length > 0) {
            result.textContent.push(slideText);
          }
          result.processedSlides++;
        }
      }

      return {
        success: true,
        data: result,
        message: `Successfully extracted text from ${result.processedSlides} slides`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.status,
        message: `Failed to extract text content: ${presentationId}`
      };
    }
  }

  /**
   * Search for text within a presentation
   * @param {string} presentationId - Google Slides presentation ID
   * @param {string} searchText - Text to search for
   * @param {boolean} caseSensitive - Whether search should be case sensitive
   * @returns {Object} Search results
   */
  async searchInPresentation(presentationId, searchText, caseSensitive = false) {
    try {
      const textContent = await this.extractTextContent(presentationId);
      
      if (!textContent.success) {
        return textContent;
      }

      const searchTerm = caseSensitive ? searchText : searchText.toLowerCase();
      const results = [];

      for (const slide of textContent.data.textContent) {
        for (const element of slide.textElements) {
          const text = caseSensitive ? element.text : element.text.toLowerCase();
          if (text.includes(searchTerm)) {
            results.push({
              slideIndex: slide.slideIndex,
              slideId: slide.slideId,
              elementId: element.elementId,
              text: element.text,
              context: this.getTextContext(element.text, searchText, 50)
            });
          }
        }
      }

      return {
        success: true,
        data: {
          presentationId: presentationId,
          searchTerm: searchText,
          caseSensitive: caseSensitive,
          totalMatches: results.length,
          matches: results
        },
        message: `Found ${results.length} matches for "${searchText}"`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to search in presentation: ${presentationId}`
      };
    }
  }

  /**
   * Get context around found text
   * @param {string} text - Full text
   * @param {string} searchTerm - Search term
   * @param {number} contextLength - Characters before and after
   * @returns {string} Context string
   */
  getTextContext(text, searchTerm, contextLength = 50) {
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return text;

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + searchTerm.length + contextLength);

    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context;
  }

  /**
   * List all presentations in Google Drive (slides only)
   * @param {number} maxResults - Maximum number of results to return
   * @returns {Object} List of presentations
   */
  async listPresentations(maxResults = 20) {
    try {
      const driveApi = this.apiManager.getDriveApi();
      
      const response = await driveApi.files.list({
        q: "mimeType='application/vnd.google-apps.presentation' and trashed=false",
        fields: 'files(id,name,createdTime,modifiedTime,owners,webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: maxResults
      });

      const presentations = response.data.files || [];

      return {
        success: true,
        data: {
          count: presentations.length,
          presentations: presentations.map(file => ({
            id: file.id,
            name: file.name,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            owner: file.owners ? file.owners[0].displayName : 'Unknown',
            webViewLink: file.webViewLink
          }))
        },
        message: `Found ${presentations.length} presentations`
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.status,
        message: 'Failed to list presentations'
      };
    }
  }
}

// ES Modules Export
export { SlidesTools };
