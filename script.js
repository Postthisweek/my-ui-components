function showContent(event, componentId) {
    event.preventDefault(); // Prevent default link behavior
    
    // Update URL hash without page reload
    history.replaceState(null, null, `#${componentId}`);
    
    // Hide all component contents and default content
    document.querySelectorAll('.component-content, #default-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Show selected component
    const activeComponent = document.getElementById(componentId);
    if (activeComponent) {
        activeComponent.classList.add('active');
        activeComponent.style.display = 'block';
        
        // Smooth scroll to component
        activeComponent.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Hide all component contents initially
    document.querySelectorAll('.component-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show default content or hash-based content
    const hash = window.location.hash.substring(1);
    const defaultComponent = hash || 'default-content';
    
    if (document.getElementById(defaultComponent)) {
        // Simulate click on the corresponding nav link
        const correspondingLink = document.querySelector(`.nav-link[onclick*="${defaultComponent}"]`);
        if (correspondingLink) {
            correspondingLink.click();
        } else {
            // Show default content if no matching component found
            document.getElementById('default-content').style.display = 'block';
        }
    } else {
        document.getElementById('default-content').style.display = 'block';
    }
});
        

        // Show notification function

                // Notification queue to manage multiple notifications
        let notificationQueue = [];
        let isProcessingQueue = false;
        
        // Default settings
        const defaultSettings = {
            duration: 5000,
            animations: true,
            progressBar: true
        };
        
        // Current settings
        let settings = {...defaultSettings};
        
        // Initialize settings from UI
        function updateSettings() {
            settings.duration = parseInt(document.getElementById('duration').value) * 1000;
            settings.animations = document.getElementById('enableAnimations').checked;
            settings.progressBar = document.getElementById('enableProgress').checked;
        }
        
        // Show a notification
        function showNotification(type, title, message, options = {}) {
            updateSettings();
            
            const notification = {
                type,
                title,
                message,
                actions: options.actions || [],
                persistent: options.persistent || false,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
            };
            
            notificationQueue.push(notification);
            processQueue();
        }
        
        // Process the notification queue
        function processQueue() {
            if (isProcessingQueue || notificationQueue.length === 0) return;
            
            isProcessingQueue = true;
            const notification = notificationQueue.shift();
            createNotificationElement(notification);
        }
        
        // Create the actual notification DOM element
        function createNotificationElement(notification) {
            const container = document.getElementById('notificationContainer');
            
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification ${notification.type}`;
            notificationEl.setAttribute('role', notification.type === 'error' ? 'alert' : 'status');
            notificationEl.setAttribute('aria-labelledby', `notification-title-${notification.id}`);
            notificationEl.setAttribute('aria-describedby', `notification-message-${notification.id}`);
            notificationEl.tabIndex = 0;
            
            // Set animation styles if enabled
            if (!settings.animations) {
                notificationEl.style.animation = 'none';
                notificationEl.style.opacity = '1';
                notificationEl.style.transform = 'translateX(0)';
            }
            
            // Icon
            const iconMap = {
                info: 'ℹ️',
                success: '✓',
                warning: '⚠️',
                error: '✕'
            };
            
            const iconEl = document.createElement('div');
            iconEl.className = 'notification-icon';
            iconEl.setAttribute('aria-hidden', 'true');
            iconEl.textContent = iconMap[notification.type];
            notificationEl.appendChild(iconEl);
            
            // Content container
            const contentEl = document.createElement('div');
            contentEl.className = 'notification-content';
            
            // Title
            const titleEl = document.createElement('div');
            titleEl.className = 'notification-title';
            titleEl.id = `notification-title-${notification.id}`;
            titleEl.textContent = notification.title;
            contentEl.appendChild(titleEl);
            
            // Message
            const messageEl = document.createElement('div');
            messageEl.className = 'notification-message';
            messageEl.id = `notification-message-${notification.id}`;
            messageEl.textContent = notification.message;
            contentEl.appendChild(messageEl);
            
            // Actions
            if (notification.actions.length > 0) {
                const actionsEl = document.createElement('div');
                actionsEl.className = 'notification-actions';
                
                notification.actions.forEach(action => {
                    const actionBtn = document.createElement('button');
                    actionBtn.className = 'notification-action';
                    actionBtn.textContent = action.label;
                    actionBtn.addEventListener('click', () => {
                        action.handler();
                        dismissNotification(notificationEl);
                    });
                    actionsEl.appendChild(actionBtn);
                });
                
                contentEl.appendChild(actionsEl);
            }
            
            notificationEl.appendChild(contentEl);
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'notification-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.setAttribute('aria-label', 'Dismiss notification');
            closeBtn.addEventListener('click', () => dismissNotification(notificationEl));
            notificationEl.appendChild(closeBtn);
            
            // Progress bar
            if (settings.progressBar && !notification.persistent) {
                const progressEl = document.createElement('div');
                progressEl.className = 'notification-progress';
                
                const progressBarEl = document.createElement('div');
                progressBarEl.className = 'notification-progress-bar';
                progressBarEl.style.width = '100%';
                
                progressEl.appendChild(progressBarEl);
                notificationEl.appendChild(progressEl);
            }
            
            container.insertBefore(notificationEl, container.firstChild);
            
            // Focus the notification for screen readers
            setTimeout(() => {
                notificationEl.focus();
            }, 100);
            
            // Auto-dismiss if not persistent
            if (!notification.persistent) {
                let remainingTime = settings.duration;
                const startTime = Date.now();
                
                if (settings.progressBar) {
                    const progressBar = notificationEl.querySelector('.notification-progress-bar');
                    const interval = 50;
                    const totalSteps = settings.duration / interval;
                    const stepPercentage = 100 / totalSteps;
                    
                    let steps = 0;
                    const progressInterval = setInterval(() => {
                        steps++;
                        const newWidth = 100 - (steps * stepPercentage);
                        progressBar.style.width = `${newWidth}%`;
                        
                        if (steps >= totalSteps) {
                            clearInterval(progressInterval);
                        }
                    }, interval);
                }
                
                const timeoutId = setTimeout(() => {
                    dismissNotification(notificationEl);
                }, remainingTime);
                
                // Pause on hover/focus
                notificationEl.addEventListener('mouseenter', () => {
                    clearTimeout(timeoutId);
                    remainingTime -= (Date.now() - startTime);
                    
                    if (settings.progressBar) {
                        notificationEl.querySelector('.notification-progress-bar').style.transition = 'none';
                    }
                });
                
                notificationEl.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        const newTimeoutId = setTimeout(() => {
                            dismissNotification(notificationEl);
                        }, remainingTime);
                        
                        if (settings.progressBar) {
                            const progressBar = notificationEl.querySelector('.notification-progress-bar');
                            progressBar.style.transition = `width ${remainingTime}ms linear`;
                            progressBar.style.width = '0%';
                        }
                        
                        notificationEl.dataset.timeoutId = newTimeoutId;
                    }, 100);
                });
                
                notificationEl.dataset.timeoutId = timeoutId;
            }
            
            // Keyboard dismissal
            notificationEl.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dismissNotification(notificationEl);
                }
            });
            
            // When notification is dismissed, process next in queue
            notificationEl.addEventListener('dismiss', () => {
                isProcessingQueue = false;
                setTimeout(processQueue, 300);
            });
        }
        
        // Dismiss a notification
        function dismissNotification(notificationEl) {
            if (settings.animations) {
                notificationEl.classList.add('slide-out');
                notificationEl.addEventListener('animationend', () => {
                    notificationEl.remove();
                    notificationEl.dispatchEvent(new Event('dismiss'));
                });
            } else {
                notificationEl.remove();
                notificationEl.dispatchEvent(new Event('dismiss'));
            }
        }
        
        // Demo functions
        function showActionableNotification() {
            showNotification('warning', 'Unsaved Changes', 'You have unsaved changes. Do you want to save them?', {
                actions: [
                    {
                        label: 'Save',
                        handler: () => {
                            showNotification('success', 'Saved!', 'Your changes have been saved.');
                        }
                    },
                    {
                        label: 'Discard',
                        handler: () => {
                            showNotification('info', 'Discarded', 'Your changes have been discarded.');
                        }
                    }
                ]
            });
        }
        
        function showPersistentNotification() {
            showNotification('error', 'Critical Error', 'The system encountered a critical error. Please contact support.', {
                persistent: true
            });
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Set initial settings from UI
            updateSettings();
            
            // Listen for Escape key to close all notifications
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const notifications = document.querySelectorAll('.notification');
                    notifications.forEach(notification => {
                        if (!notification.dataset.persistent) {
                            dismissNotification(notification);
                        }
                    });
                }
            });
        });

        // error message and summary validation

        document.addEventListener("DOMContentLoaded", function () {
  // Initialize the form validation
  document.getElementById("myForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission for validation purposes
    
    let errors = [];
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const errorSummary = document.getElementById("errorSummary");
    const statusMessage = document.getElementById("statusMessage");
  
    // Clear previous errors
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
  
    if (!email.value) {
      errors.push(`<a href="#" class="error-link" data-field="email">Email is required.</a>`);
      document.getElementById("emailError").textContent = "Email is required.";
      email.focus();
    }
  
    if (!password.value) {
      errors.push(`<a href="#" class="error-link" data-field="password">Password is required.</a>`);
      document.getElementById("passwordError").textContent = "Password is required.";
    }
  
    // If errors exist, show summary
    if (errors.length > 0) {
      errorSummary.innerHTML = `<p>Please fix the following errors:</p><ul>${errors.map(err => `<li>${err}</li>`).join("")}</ul>`;
      errorSummary.classList.remove("hidden");
      errorSummary.focus();
  
      // Make error summary links focus the correct input field
      document.querySelectorAll(".error-link").forEach(link => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          document.getElementById(event.target.dataset.field).focus();
        });
      });
    } else {
      // Hide error summary and show success message
      errorSummary.classList.add("hidden");
      statusMessage.textContent = "Form submitted successfully!";
    }
  });
    //dismiss error summary
    document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        document.getElementById("errorSummary").classList.add("hidden");
        document.getElementById("emailError").textContent = "";
        document.getElementById("passwordError").textContent = "";
    }
});
});

// Show status message dialog

const openDialog = document.getElementById("openDialog");
const closeDialog = document.getElementById("closeDialog");
const statusDialog = document.getElementById("statusDialog");

openDialog.addEventListener("click", () => {
  statusDialog.style.display = "block";
  statusDialog.setAttribute("aria-hidden", "false");
  closeDialog.focus();
});

closeDialog.addEventListener("click", () => {
  statusDialog.style.display = "none";
  statusDialog.setAttribute("aria-hidden", "true");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && statusDialog.getAttribute("aria-hidden") === "false") {
    statusDialog.style.display = "none";
    statusDialog.setAttribute("aria-hidden", "true");
  }
});

    // Accordion functionality
    document.addEventListener('DOMContentLoaded', () => {
    const accordionButtons = document.querySelectorAll('.accordion-item > button');
  
    accordionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
  
        // Collapse all sections
        accordionButtons.forEach((btn) => {
          btn.setAttribute('aria-expanded', 'false');
          const content = document.getElementById(btn.getAttribute('aria-controls'));
          content.style.display = 'none';
        });
  
        // Expand the clicked section if it was not already expanded
        if (!expanded) {
          button.setAttribute('aria-expanded', 'true');
          const content = document.getElementById(button.getAttribute('aria-controls'));
          content.style.display = 'block';
        }
      });
    });
  });
        // Tabs functionality
                document.addEventListener('DOMContentLoaded', function() {
            // Tab navigation
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons and contents
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-selected', 'false');
                    });
                    
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // Add active class to clicked button and corresponding content
                    this.classList.add('active');
                    this.setAttribute('aria-selected', 'true');
                    
                    const targetId = this.getAttribute('aria-controls');
                    document.getElementById(targetId).classList.add('active');
                });
            });

            
        });

        // Modal dialog functionality
                document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('exampleModal');
            const openBtn = document.getElementById('openModalBtn');
            const closeBtn = modal.querySelector('.modal-close');
            const modalTitle = document.getElementById('modalTitle');
            
            // Keep track of focused element before modal opens
            let focusedElementBeforeModal;
            
            // Elements inside modal
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const modalFocusableElements = modal.querySelectorAll(focusableElements);
            const firstFocusableElement = modalFocusableElements[0];
            const lastFocusableElement = modalFocusableElements[modalFocusableElements.length - 1];
            
            // Open modal
            function openModal() {
                // Save current focus
                focusedElementBeforeModal = document.activeElement;
                
                // Show modal
                modal.setAttribute('aria-hidden', 'false');
                modal.classList.add('active');
                
                // Focus first element
                setTimeout(() => {
                    firstFocusableElement.focus();
                }, 100);
                
                // Prevent scrolling on body
                document.body.style.overflow = 'hidden';
            }
            
            // Close modal
            function closeModal() {
                modal.setAttribute('aria-hidden', 'true');
                modal.classList.remove('active');
                
                // Restore focus
                if (focusedElementBeforeModal) {
                    focusedElementBeforeModal.focus();
                }
                
                // Restore scrolling
                document.body.style.overflow = '';
            }
            
            // Event listeners
            openBtn.addEventListener('click', openModal);
            closeBtn.addEventListener('click', closeModal);
            
            // Close when clicking on backdrop
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Trap focus inside modal
            modal.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstFocusableElement) {
                            e.preventDefault();
                            lastFocusableElement.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastFocusableElement) {
                            e.preventDefault();
                            firstFocusableElement.focus();
                        }
                    }
                }
                
                // Close on Escape
                if (e.key === 'Escape') {
                    closeModal();
                }
            });
            
            // For demo purposes - simulate form submission
            const primaryActionBtn = modal.querySelector('.btn-primary');
            primaryActionBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Primary action clicked!');
                closeModal();
            });
        });

        // Progress Wizard functionality
        class ProgressWizard {
            constructor(containerId) {
                this.container = document.getElementById(containerId);
                this.steps = Array.from(this.container.querySelectorAll('.wizard-step'));
                this.panels = Array.from(this.container.querySelectorAll('.wizard-panel'));
                this.currentStep = 0;
                this.progressText = document.getElementById('progressText');
                this.nextBtn = document.getElementById('nextBtn');
                this.backBtn = document.getElementById('backBtn');
                this.skipBtn = document.getElementById('skipBtn');
                this.is3DEnabled = false;

                this.init();
            }

            init() {
                this.setupEventListeners();
                this.updateProgress();
                this.setupKeyboardNavigation();
                this.checkFor3DSupport();
            }

            setupEventListeners() {
                // Step navigation
                this.steps.forEach((step, index) => {
                    step.addEventListener('click', () => this.goToStep(index));
                    step.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.goToStep(index);
                        }
                    });
                });

                // Button navigation
                this.nextBtn.addEventListener('click', () => this.nextStep());
                this.backBtn.addEventListener('click', () => this.prevStep());
                this.skipBtn.addEventListener('click', () => this.nextStep());

                // Form validation on input
                document.querySelectorAll('.wizard-form-control').forEach(input => {
                    input.addEventListener('input', () => {
                        if (this.panels[this.currentStep].contains(input)) {
                            this.validateCurrentStep();
                        }
                    });
                });
            }

            setupKeyboardNavigation() {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowRight') {
                        this.nextStep();
                    } else if (e.key === 'ArrowLeft') {
                        this.prevStep();
                    }
                });

                // Tab navigation between steps
                this.container.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab' && e.target.classList.contains('wizard-step')) {
                        e.preventDefault();
                        const currentIndex = this.steps.indexOf(e.target);
                        const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
                        
                        if (nextIndex >= 0 && nextIndex < this.steps.length) {
                            this.steps[nextIndex].focus();
                        }
                    }
                });
            }

            checkFor3DSupport() {
                // Simple feature detection for 3D transforms
                const testEl = document.createElement('div');
                if ('transform' in testEl.style && 'perspective' in testEl.style) {
                    this.is3DEnabled = true;
                    this.container.classList.add('experimental-3d');
                    this.panels.forEach(panel => panel.classList.add('experimental-3d'));
                }
            }

            goToStep(stepIndex) {
                // Only allow going to completed steps or the next in sequence
                if (stepIndex > this.currentStep && !this.validateCurrentStep()) {
                    return;
                }

                if (stepIndex < 0 || stepIndex >= this.steps.length) return;

                // Update steps
                this.steps[this.currentStep].classList.remove('current');
                this.steps[stepIndex].classList.add('current');

                // Mark previous steps as completed
                if (stepIndex > this.currentStep) {
                    for (let i = 0; i < stepIndex; i++) {
                        this.steps[i].classList.add('completed');
                    }
                }

                // Update panels
                this.panels[this.currentStep].classList.remove('active');
                this.panels[this.currentStep].setAttribute('hidden', '');
                
                if (this.is3DEnabled) {
                    const directionClass = stepIndex > this.currentStep ? 'next' : 'prev';
                    this.panels[this.currentStep].classList.add(directionClass);
                    setTimeout(() => {
                        this.panels[this.currentStep].classList.remove(directionClass);
                    }, 600);
                }

                this.panels[stepIndex].classList.add('active');
                this.panels[stepIndex].removeAttribute('hidden');

                this.currentStep = stepIndex;
                this.updateProgress();

                // Focus the first input in the new panel for keyboard users
                setTimeout(() => {
                    const firstInput = this.panels[this.currentStep].querySelector('input, select, textarea');
                    if (firstInput) firstInput.focus();
                }, 100);
            }

            nextStep() {
                if (!this.validateCurrentStep()) return;

                if (this.currentStep === this.panels.length - 2) {
                    this.prepareReviewContent();
                }

                if (this.currentStep < this.steps.length - 1) {
                    this.goToStep(this.currentStep + 1);
                } else {
                    this.submitForm();
                }
            }

            prevStep() {
                if (this.currentStep > 0) {
                    this.goToStep(this.currentStep - 1);
                }
            }

            validateCurrentStep() {
                let isValid = true;
                const currentPanel = this.panels[this.currentStep];
                const inputs = currentPanel.querySelectorAll('[required]');

                inputs.forEach(input => {
                    const errorElement = document.getElementById(`${input.id}Error`) || { classList: { add: () => {}, remove: () => {} } };
                    
                    if (!input.checkValidity()) {
                        errorElement.classList.add('active');
                        isValid = false;
                        
                        // Add error class to input
                        input.classList.add('error');
                        input.addEventListener('input', function clearError() {
                            errorElement.classList.remove('active');
                            input.classList.remove('error');
                            input.removeEventListener('input', clearError);
                        }, { once: true });
                    } else {
                        errorElement.classList.remove('active');
                        input.classList.remove('error');
                    }
                });

                // Update next button state
                this.nextBtn.disabled = !isValid;

                return isValid;
            }

            prepareReviewContent() {
                const reviewContent = document.getElementById('reviewContent');
                if (reviewContent) {
                    reviewContent.innerHTML = '';
                }

                // Collect all form data
                const formData = {
                    'First Name': document.getElementById('firstName').value,
                    'Last Name': document.getElementById('lastName').value,
                    'Email': document.getElementById('email').value,
                    'Theme Preference': document.getElementById('theme').value,
                    'Notifications': Array.from(document.querySelectorAll('input[name="notifications"]:checked')).map(el => el.value).join(', ') || 'None'
                };

                // Create review items
                for (const [label, value] of Object.entries(formData)) {
                    const item = document.createElement('div');
                    item.style.marginBottom = '0.5rem';
                    item.innerHTML = `<strong>${label}:</strong> ${value}`;
                    reviewContent.appendChild(item);
                }
            }

            updateProgress() {
                // Update progress text
                this.progressText.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;

                // Update button states
                this.backBtn.disabled = this.currentStep === 0;
                
                if (this.currentStep === this.steps.length - 1) {
                    this.nextBtn.textContent = 'Submit';
                    this.skipBtn.hidden = true;
                } else {
                    this.nextBtn.textContent = 'Next';
                    this.skipBtn.hidden = this.currentStep !== 1; // Only show skip on step 2 for demo
                }

                // Update ARIA attributes
                this.steps.forEach((step, index) => {
                    step.setAttribute('aria-selected', index === this.currentStep);
                    step.setAttribute('tabindex', index === this.currentStep ? '0' : '-1');
                });
            }

            submitForm() {
                if (!this.validateCurrentStep()) return;

                // In a real app, you would submit the form here
                alert('Form submitted successfully!');
                console.log('Form data:', {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    theme: document.getElementById('theme').value,
                    notifications: Array.from(document.querySelectorAll('input[name="notifications"]:checked')).map(el => el.value)
                });

                // Show completion state
                this.steps.forEach(step => {
                    step.classList.add('completed');
                    step.classList.remove('current');
                });
                
                this.nextBtn.disabled = true;
                this.progressText.textContent = 'Setup complete!';
            }
        }

        // Initialize the wizard
        document.addEventListener('DOMContentLoaded', () => {
            const wizard = new ProgressWizard('wizardContainer');
            
            // For demo purposes - enable 3D effect with a query parameter
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('3d') === 'true' && wizard.is3DEnabled) {
                wizard.container.classList.add('experimental-3d');
                wizard.panels.forEach(panel => panel.classList.add('experimental-3d'));
            }
        });


          // Pagination functionality
          document.addEventListener('DOMContentLoaded', function() {
            const pagination = document.getElementById('pagination');
            const pageLinks = pagination.querySelectorAll('.page-link');
            const contentArea = document.getElementById('pagination-content');
            let currentPage = 1;
            const totalPages = 5; // Would normally come from server
            
            // Function to update pagination state
            function updatePagination(newPage) {
                // Validate page number
                if (newPage < 1 || newPage > totalPages) return;
                
                currentPage = newPage;
                
                // Update active state
                pageLinks.forEach(link => {
                    link.classList.remove('active', 'disabled');
                    
                    // Update number links
                    if (parseInt(link.dataset.page) === newPage) {
                        link.classList.add('active');
                    }
                    
                    // Update prev/next buttons
                    if (link.dataset.page === 'prev') {
                        link.classList.toggle('disabled', newPage === 1);
                    } else if (link.dataset.page === 'next') {
                        link.classList.toggle('disabled', newPage === totalPages);
                    }
                });
                
                // Update content (in a real app, this would fetch new data)
                updateContent(newPage);
                
                // Update URL without reloading
                history.pushState(null, '', `?page=${newPage}`);
            }
            
            // Function to update displayed content
            function updateContent(page) {
                contentArea.innerHTML = `
                    <h2>Page ${page} Content</h2>
                    <p>This is the content for page ${page}. In a real application, 
                    this would be loaded from a server or filtered from existing data.</p>
                    <p>Current items: ${(page-1)*10 + 1} to ${page*10}</p>
                `;
            }
            
            // Click handler for pagination
            function handlePaginationClick(e) {
                e.preventDefault();
                
                const link = e.currentTarget;
                if (link.classList.contains('disabled')) return;
                
                let newPage;
                
                if (link.dataset.page === 'prev') {
                    newPage = currentPage - 1;
                } else if (link.dataset.page === 'next') {
                    newPage = currentPage + 1;
                } else {
                    newPage = parseInt(link.dataset.page);
                }
                
                updatePagination(newPage);
            }
            
            // Add click event listeners
            pageLinks.forEach(link => {
                link.addEventListener('click', handlePaginationClick);
            });
            
            // Keyboard navigation support
            pageLinks.forEach(link => {
                link.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePaginationClick(e);
                    }
                });
            });
            
            // Check initial page from URL
            function checkInitialPage() {
                const urlParams = new URLSearchParams(window.location.search);
                const pageParam = urlParams.get('page');
                if (pageParam && !isNaN(pageParam) && pageParam >= 1 && pageParam <= totalPages) {
                    updatePagination(parseInt(pageParam));
                }
            }
            
            // Handle browser back/forward
            window.addEventListener('popstate', function() {
                checkInitialPage();
            });
            
            // Initialize
            checkInitialPage();
        });

        
        // Breadcrumb functionality
        document.addEventListener("DOMContentLoaded", () => {
    const breadcrumbs = document.querySelectorAll(".breadcrumb-link");
    const contentContainer = document.createElement("div");
    contentContainer.id = "breadcrumb-content";
    document.querySelector(".breadcrumb").appendChild(contentContainer);

    const breadcrumbData = {
        "Home": "Welcome to our homepage, where you can explore everything we offer.",
        "Fruits": "Here, you'll find fresh and exotic fruits from around the world.",
        "Luxurious Cars": "Discover high-end vehicles, luxury car brands, and performance models."
    };

    breadcrumbs.forEach((breadcrumb, index) => {
        // Set appropriate ARIA attributes
        breadcrumb.setAttribute("tabindex", "0");
        breadcrumb.setAttribute("role", "link");

        breadcrumb.addEventListener("click", (event) => {
            event.preventDefault();
            updateContent(breadcrumb);
        });

        breadcrumb.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                updateContent(breadcrumb);
            }
        });

        // Auto-display the active breadcrumb content on load
        if (breadcrumb.hasAttribute("aria-current")) {
            updateContent(breadcrumb);
        }
    });

    function updateContent(breadcrumb) {
        const text = breadcrumb.textContent.trim();
        contentContainer.innerHTML = `<p>${breadcrumbData[text] || "No content available."}</p>`;

        breadcrumbs.forEach((item) => item.removeAttribute("aria-current"));
        breadcrumb.setAttribute("aria-current", "page");
    }
});

        // Filters functionality
        const items = [
    { name: "Website Accessibility Guide", category: "tech", free: true },
    { name: "Inclusive UI Design", category: "design", free: false },
    { name: "Business Ethics in UX", category: "business", free: true },
    { name: "Dark Mode vs. High Contrast", category: "tech", free: false }
];

document.getElementById('filter-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const category = document.getElementById('category-filter').value;
    const isFree = document.getElementById('free-filter').checked;
    const searchQuery = document.getElementById('search-filter').value.toLowerCase();

    const filteredItems = items.filter(item => {
        return (category === "all" || item.category === category) &&
               (!isFree || item.free) &&
               (searchQuery === "" || item.name.toLowerCase().includes(searchQuery));
    });

    updateResults(filteredItems);
});

// Function to update the results with accessibility-friendly feedback
function updateResults(filteredItems) {
    const resultsContainer = document.getElementById('filtered-items');
    resultsContainer.innerHTML = ""; 

    if (filteredItems.length === 0) {
        resultsContainer.innerHTML = "<li>No matching items found.</li>";
    } else {
        filteredItems.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item.name;
            resultsContainer.appendChild(listItem);
        });
    }
}

       // Sort functionality
           // Enhanced accessible sorting with ARIA live regions
    const sortSelect = document.getElementById('sort-select');
        const announcement = document.getElementById('sort-announcement');
        let isLoading = false;
        let loadingIndicator = null;

        sortSelect.addEventListener('change', function() {
            if (isLoading) return;
            
            const [key, direction] = this.value.split('-');
            isLoading = true;
            
            // Announce sorting start
            announcement.textContent = 'Sorting products...';
            
            // Create and show loading indicator
            loadingIndicator = document.createElement('span');
            loadingIndicator.className = 'sort-loading';
            loadingIndicator.setAttribute('aria-hidden', 'true');
            this.parentNode.appendChild(loadingIndicator);
            
            // Disable select during operation
            this.disabled = true;
            
            // Perform sort with simulated delay
            setTimeout(() => {
                const sortResult = sortAdvancedTable(key, direction);
                
                // Remove loading indicator
                if (loadingIndicator && loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
                
                // Re-enable select
                this.disabled = false;
                isLoading = false;
                
                // Announce completion
                announcement.textContent = `Products sorted by ${getSortDescription(key, direction)}. ${sortResult.count} items sorted.`;
            }, 500);
        });

        function sortAdvancedTable(key, direction) {
            const table = document.querySelector('.data-table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            rows.sort((a, b) => {
                const aValue = a.querySelector(`td:nth-child(${getAdvancedIndex(key)})`).textContent;
                const bValue = b.querySelector(`td:nth-child(${getAdvancedIndex(key)})`).textContent;
                
                if (key === 'date') {
                    return direction === 'asc' 
                        ? new Date(aValue) - new Date(bValue)
                        : new Date(bValue) - new Date(aValue);
                } else if (key === 'price') {
                    const aNum = parseFloat(aValue.replace('$', ''));
                    const bNum = parseFloat(bValue.replace('$', ''));
                    return direction === 'asc' ? aNum - bNum : bNum - aNum;
                } else if (key === 'rating') {
                    return direction === 'asc' 
                        ? parseFloat(aValue) - parseFloat(bValue)
                        : parseFloat(bValue) - parseFloat(aValue);
                } else {
                    return direction === 'asc' 
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
            });
            
            // Reattach sorted rows
            tbody.innerHTML = '';
            rows.forEach(row => tbody.appendChild(row));
            
            return {
                count: rows.length,
                criteria: `${key}-${direction}`
            };
        }

        function getAdvancedIndex(key) {
            switch(key) {
                case 'name': return 1;
                case 'date': return 2;
                case 'price': return 3;
                case 'rating': return 4;
                default: return 1;
            }
        }
        
        function getSortDescription(key, direction) {
            const descriptions = {
                'name-asc': 'name (A-Z)',
                'name-desc': 'name (Z-A)',
                'date-asc': 'date (oldest first)',
                'date-desc': 'date (newest first)',
                'price-asc': 'price (low to high)',
                'price-desc': 'price (high to low)'
            };
            return descriptions[`${key}-${direction}`] || 'selected criteria';
        }

        // Layout functionality
        document.addEventListener("DOMContentLoaded", function () {
    // Animate grid items in sequence
    document.querySelectorAll(".grid-item").forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
    });

    // Animate table rows in sequence
    document.querySelectorAll("tbody tr").forEach((row, index) => {
        row.style.animationDelay = `${index * 0.3}s`;
    });
});

     // Tags functionality
     document.addEventListener('DOMContentLoaded', function() {
            const tagsList = document.getElementById('tagsList');
            const tagInput = document.getElementById('tagInput');
            const announcement = document.getElementById('tags-announcement');
            const tags = [];
            
            // Add tag function
            function addTag(text) {
                if (!text.trim()) return;
                
                // Validate tag (example: no special characters)
                const isValid = /^[a-zA-Z0-9\-_ ]+$/.test(text);
                const tagId = 'tag-' + Date.now();
                
                const tag = document.createElement('li');
                tag.className = 'tag';
                tag.id = tagId;
                tag.setAttribute('role', 'listitem');
                if (!isValid) {
                    tag.setAttribute('data-invalid', 'true');
                    tag.setAttribute('aria-invalid', 'true');
                }
                
                tag.innerHTML = `
                    <span>${text}</span>
                    <button 
                        class="tag-remove" 
                        aria-label="Remove ${text}"
                        data-tag-id="${tagId}">
                        &times;
                    </button>
                `;
                
                tagsList.appendChild(tag);
                tags.push({ id: tagId, text, isValid });
                
                // Announce addition
                announcement.textContent = `Tag added: ${text}. ${tags.length} tags total.`;
                
                // Focus the new tag's remove button for keyboard users
                setTimeout(() => {
                    tag.querySelector('.tag-remove').focus();
                }, 0);
                
                tagInput.value = '';
            }
            
            // Remove tag function
            function removeTag(tagId) {
                const tagIndex = tags.findIndex(tag => tag.id === tagId);
                if (tagIndex === -1) return;
                
                const removedTag = tags[tagIndex];
                tags.splice(tagIndex, 1);
                
                const tagElement = document.getElementById(tagId);
                if (tagElement) {
                    tagElement.remove();
                }
                
                // Announce removal
                announcement.textContent = `Tag removed: ${removedTag.text}. ${tags.length} tags remaining.`;
                
                // Focus input after removal
                tagInput.focus();
            }
            
            // Event listeners
            tagInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(this.value);
                } else if (e.key === 'Backspace' && this.value === '' && tags.length > 0) {
                    // Remove last tag when backspace pressed on empty input
                    removeTag(tags[tags.length - 1].id);
                }
            });
            
            // Delegated event listener for remove buttons
            tagsList.addEventListener('click', function(e) {
                if (e.target.classList.contains('tag-remove')) {
                    const tagId = e.target.getAttribute('data-tag-id');
                    removeTag(tagId);
                }
            });
            
            // Keyboard navigation for remove buttons
            tagsList.addEventListener('keydown', function(e) {
                if (e.key === 'Delete' && e.target.classList.contains('tag-remove')) {
                    const tagId = e.target.getAttribute('data-tag-id');
                    removeTag(tagId);
                }
            });
            
            // Voice recognition support
            tagInput.addEventListener('input', function() {
                // Support for voice input that might add commas
                if (this.value.includes(',')) {
                    const tagTexts = this.value.split(',').map(t => t.trim());
                    this.value = '';
                    tagTexts.forEach(text => addTag(text));
                }
            });
        });

          // Timeline functionality
          document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = Array.from(document.querySelectorAll('.timeline-item'));
    const announcement = document.getElementById('timeline-announcement');
    const timelineContainer = document.querySelector(".timeline-items");

    // Make all timeline items focusable
    timelineItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        
        // Click handler
        item.addEventListener('click', function() {
            announceTimelineItem(item);
        });
    });

    // Keyboard navigation between timeline items
    timelineContainer.addEventListener('keydown', function(e) {
        const currentIndex = timelineItems.indexOf(document.activeElement);
        
        // Escape key - exit timeline
        if (e.key === 'Escape') {
            timelineContainer.setAttribute('aria-expanded', 'false');
            document.querySelector('button, [href], input').focus();
            return;
        }
        
        // Arrow keys - navigate between items
        if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % timelineItems.length;
            timelineItems[nextIndex].focus();
            announceTimelineItem(timelineItems[nextIndex]);
        }
        else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + timelineItems.length) % timelineItems.length;
            timelineItems[prevIndex].focus();
            announceTimelineItem(timelineItems[prevIndex]);
        }
        
        // Tab key - normal navigation (modified to work between timelines)
        if (e.key === 'Tab') {
            if (!e.shiftKey && currentIndex === timelineItems.length - 1) {
                // If tabbing forward from last item, move to next focusable element
                const allFocusables = Array.from(document.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ));
                const nextIndex = allFocusables.indexOf(timelineItems[currentIndex]) + 1;
                if (nextIndex < allFocusables.length) {
                    e.preventDefault();
                    allFocusables[nextIndex].focus();
                }
            }
            else if (e.shiftKey && currentIndex === 0) {
                // If shift+tabbing from first item, move to previous focusable element
                const allFocusables = Array.from(document.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ));
                const prevIndex = allFocusables.indexOf(timelineItems[currentIndex]) - 1;
                if (prevIndex >= 0) {
                    e.preventDefault();
                    allFocusables[prevIndex].focus();
                }
            }
        }
    });

    function announceTimelineItem(item) {
        const status = item.getAttribute('data-status');
        const title = item.querySelector('.timeline-title').textContent;
        const date = item.querySelector('.timeline-date').textContent;

        let statusText = '';
        switch (status) {
            case 'past': statusText = 'Past event'; break;
            case 'current': statusText = 'Current event'; break;
            case 'future': statusText = 'Upcoming event'; break;
        }

        announcement.textContent = `${statusText}: ${title}, scheduled for ${date}.`;
    }

    // Initial announcement
    announcement.textContent = `Timeline loaded with ${timelineItems.length} events. Use arrow keys to navigate between timeline items.`;

    // Accessibility attributes
    timelineContainer.setAttribute('role', 'list');
    timelineContainer.setAttribute('aria-label', 'Timeline events');
});

     //Loading Spinner functionality
     // Helper function for screen reader only text
        function createScreenReaderOnlyStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border-width: 0;
                }
            `;
            document.head.appendChild(style);
        }

        // Initialize
        function showSpinner() {
    const spinner = document.querySelector('.spinner-container');
    if (spinner) {
        spinner.classList.add('active');
        // Announce loading to screen readers
        const announcement = document.getElementById('loading-spinner-announcement');
        if (announcement) {
            announcement.textContent = 'Content is loading, please wait...';
        }
    }
}

function hideSpinner() {
    const spinner = document.querySelector('.spinner-container');
    if (spinner) {
        spinner.classList.remove('active');
        // Clear loading announcement
        const announcement = document.getElementById('loading-spinner-announcement');
        if (announcement) {
            announcement.textContent = '';
        }
    }
}

// Example usage with your content loading
function showContent(event, componentId) {
    event.preventDefault();
    
    // Show spinner
    showSpinner();
    
    // Hide current content
    document.querySelectorAll('.component-content, #default-content').forEach(content => {
        content.style.display = 'none';
    });

    // Simulate loading delay (remove this in production)
    setTimeout(() => {
        // Show new content
        const content = document.getElementById(componentId);
        if (content) {
            content.style.display = 'block';
            content.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Update active link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // Hide spinner
        hideSpinner();
    }, 800); // Adjust this timeout as needed
}

// Add event listener for your demo button
document.getElementById('loadButton')?.addEventListener('click', function() {
    showSpinner();
    setTimeout(hideSpinner, 2000); // Hide after 2 seconds for demo
});
